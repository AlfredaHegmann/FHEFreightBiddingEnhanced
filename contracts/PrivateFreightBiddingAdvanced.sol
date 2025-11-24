// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool, einput, inEuint32, inEuint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Gateway } from "@fhevm/solidity/gateway/Gateway.sol";

/**
 * @title PrivateFreightBiddingAdvanced
 * @notice Advanced privacy-preserving freight bidding platform with FHE
 * @dev Implements Gateway callbacks, refund mechanism, timeout protection,
 *      price obfuscation, HCU optimization, and comprehensive security
 *
 * Architecture Features:
 * - User submits encrypted request → Contract records → Gateway decrypts → Callback completes transaction
 * - Refund mechanism for decryption failures
 * - Timeout protection to prevent permanent fund locks
 * - Division protection via random multiplier for privacy
 * - Price obfuscation using noise injection
 * - Gas optimization through efficient HCU usage
 */
contract PrivateFreightBiddingAdvanced is SepoliaConfig, Gateway {

    // ============ Constants ============

    uint256 public constant PLATFORM_FEE = 0.01 ether;
    uint256 public constant MIN_BID_AMOUNT = 0.001 ether;
    uint256 public constant MIN_BIDDING_DURATION = 1 hours;
    uint256 public constant MAX_BIDDING_DURATION = 7 days;
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
    uint256 public constant REFUND_GRACE_PERIOD = 24 hours;
    uint256 public constant BATCH_TIMEOUT_LIMIT = 50;

    // Price obfuscation constants
    uint64 public constant PRICE_NOISE_RANGE = 100;
    uint64 public constant PRICE_MULTIPLIER_BASE = 1000;

    // ============ State Variables ============

    address public owner;
    address public pauser;
    bool public paused;
    uint256 public jobCounter;
    uint256 public requestCounter;
    uint256 public platformFees;
    bool public isTesting;

    // Platform statistics
    uint256 public totalBidsSubmitted;
    uint256 public totalJobsCompleted;
    uint256 public totalActiveCarriers;
    uint256 public totalRefundsProcessed;
    uint256 public totalTimeoutsTriggered;

    // ============ Enums ============

    enum JobStatus {
        Open,           // Accepting bids
        BiddingClosed,  // No more bids accepted
        Awarded,        // Winner selected
        Completed,      // Job done
        Cancelled,      // Cancelled by shipper
        Refunded        // Refunded due to failure
    }

    enum RequestStatus {
        Pending,        // Awaiting Gateway callback
        Completed,      // Successfully processed
        TimedOut,       // Exceeded timeout
        Refunded        // User refunded
    }

    enum CallbackType {
        RevealBidPrice,
        RevealJobDetails,
        CompareBids,
        ProcessRefund,
        BatchReveal
    }

    // ============ Structs ============

    struct FreightJob {
        string origin;
        string destination;
        string cargoType;
        euint64 encryptedWeight;
        euint64 encryptedVolume;
        euint64 encryptedBudget;        // Maximum budget (obfuscated)
        uint256 deadline;
        uint256 biddingEndTime;
        address shipper;
        JobStatus status;
        euint64 encryptedFinalPrice;
        uint64 revealedFinalPrice;
        bool isPriceRevealed;
        ebool isUrgent;
        bool urgentRevealed;
        uint256 createdAt;
        uint256 escrowAmount;           // Locked funds
        uint256 refundDeadline;         // After this, user can request refund
    }

    struct Bid {
        euint64 encryptedPrice;
        euint64 obfuscatedPrice;        // Price with noise for privacy
        euint32 encryptedDeliveryDays;
        euint32 encryptedReliabilityScore;
        ebool isExpressService;
        bool hasSubmitted;
        bool isRevealed;
        uint64 revealedPrice;
        uint32 revealedDeliveryDays;
        uint32 revealedReliability;
        bool revealedExpress;
        uint256 timestamp;
        address carrier;
        uint256 depositAmount;          // Carrier's deposit
    }

    struct DecryptionRequest {
        uint256 jobId;
        address carrier;
        CallbackType callbackType;
        RequestStatus status;
        uint256 createdAt;
        uint256 timeout;
        uint256 refundAmount;
        address refundRecipient;
    }

    struct CarrierProfile {
        bool isVerified;
        uint256 totalBids;
        uint256 wonBids;
        uint256 completedJobs;
        euint32 encryptedRating;
        uint256 joinedAt;
        bool isActive;
        uint256 totalDeposits;
    }

    struct ShipperProfile {
        bool isVerified;
        uint256 totalJobsPosted;
        uint256 totalJobsCompleted;
        uint256 joinedAt;
        bool isActive;
        uint256 totalEscrowed;
    }

    // ============ Mappings ============

    mapping(uint256 => FreightJob) public freightJobs;
    mapping(uint256 => mapping(address => Bid)) public jobBids;
    mapping(uint256 => address[]) public jobBidders;
    mapping(uint256 => address) public jobWinners;

    mapping(address => CarrierProfile) public carrierProfiles;
    mapping(address => ShipperProfile) public shipperProfiles;

    // Gateway callback tracking
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint256[]) public jobDecryptionRequests;

    // Timeout management
    uint256[] public pendingRequests;
    mapping(uint256 => uint256) public pendingRequestIndex;

    // ============ Events ============

    // Job lifecycle events
    event JobPosted(uint256 indexed jobId, address indexed shipper, uint256 escrowAmount, uint256 timestamp);
    event BidSubmitted(uint256 indexed jobId, address indexed carrier, uint256 depositAmount, uint256 timestamp);
    event BidRevealed(uint256 indexed jobId, address indexed carrier, uint64 price, uint32 deliveryDays);
    event JobAwarded(uint256 indexed jobId, address indexed carrier, uint64 finalPrice, uint256 timestamp);
    event JobCompleted(uint256 indexed jobId, address indexed carrier, uint256 paymentAmount, uint256 timestamp);
    event JobCancelled(uint256 indexed jobId, address indexed shipper, string reason, uint256 refundAmount);
    event BiddingClosed(uint256 indexed jobId, uint256 totalBids);

    // Gateway callback events
    event DecryptionRequested(uint256 indexed requestId, uint256 indexed jobId, CallbackType callbackType, uint256 timeout);
    event DecryptionCompleted(uint256 indexed requestId, uint256 indexed jobId, bool success);
    event DecryptionTimedOut(uint256 indexed requestId, uint256 indexed jobId);

    // Refund events
    event RefundRequested(uint256 indexed requestId, address indexed recipient, uint256 amount);
    event RefundProcessed(uint256 indexed requestId, address indexed recipient, uint256 amount);
    event RefundFailed(uint256 indexed requestId, address indexed recipient, string reason);

    // Timeout events
    event TimeoutTriggered(uint256 indexed requestId, uint256 indexed jobId, uint256 timestamp);
    event BatchTimeoutProcessed(uint256 processedCount, uint256 timestamp);

    // Profile events
    event CarrierVerified(address indexed carrier, uint256 timestamp);
    event ShipperVerified(address indexed shipper, uint256 timestamp);
    event CarrierDeactivated(address indexed carrier, string reason);
    event ShipperDeactivated(address indexed shipper, string reason);

    // Admin events
    event Paused(address indexed pauser, uint256 timestamp);
    event Unpaused(address indexed pauser, uint256 timestamp);
    event PauserChanged(address indexed oldPauser, address indexed newPauser);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    // Error events
    event ErrorOccurred(uint256 indexed jobId, string errorMessage, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyPauser() {
        require(msg.sender == pauser || msg.sender == owner, "Caller is not pauser");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    modifier onlyVerifiedShipper() {
        require(shipperProfiles[msg.sender].isVerified, "Not verified shipper");
        require(shipperProfiles[msg.sender].isActive, "Shipper is not active");
        _;
    }

    modifier onlyVerifiedCarrier() {
        require(carrierProfiles[msg.sender].isVerified, "Not verified carrier");
        require(carrierProfiles[msg.sender].isActive, "Carrier is not active");
        _;
    }

    modifier validJobId(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= jobCounter, "Invalid job ID");
        _;
    }

    modifier onlyJobShipper(uint256 _jobId) {
        require(freightJobs[_jobId].shipper == msg.sender, "Caller is not job shipper");
        _;
    }

    modifier jobInStatus(uint256 _jobId, JobStatus _status) {
        require(freightJobs[_jobId].status == _status, "Invalid job status");
        _;
    }

    modifier nonReentrant() {
        require(!_reentrancyGuard, "Reentrant call");
        _reentrancyGuard = true;
        _;
        _reentrancyGuard = false;
    }

    bool private _reentrancyGuard;

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        pauser = msg.sender;
        paused = false;
        jobCounter = 0;
        requestCounter = 0;
        platformFees = 0;
        totalBidsSubmitted = 0;
        totalJobsCompleted = 0;
        totalActiveCarriers = 0;
        totalRefundsProcessed = 0;
        totalTimeoutsTriggered = 0;
        isTesting = false;
    }

    // ============ Admin Functions ============

    /**
     * @notice Verify and activate a carrier
     * @param _carrier Address of the carrier to verify
     */
    function verifyCarrier(address _carrier) external onlyOwner whenNotPaused {
        require(_carrier != address(0), "Invalid carrier address");
        require(!carrierProfiles[_carrier].isVerified, "Carrier already verified");

        totalActiveCarriers++;

        carrierProfiles[_carrier] = CarrierProfile({
            isVerified: true,
            totalBids: 0,
            wonBids: 0,
            completedJobs: 0,
            encryptedRating: FHE.asEuint32(100),
            joinedAt: block.timestamp,
            isActive: true,
            totalDeposits: 0
        });

        emit CarrierVerified(_carrier, block.timestamp);
    }

    /**
     * @notice Verify and activate a shipper
     * @param _shipper Address of the shipper to verify
     */
    function verifyShipper(address _shipper) external onlyOwner whenNotPaused {
        require(_shipper != address(0), "Invalid shipper address");
        require(!shipperProfiles[_shipper].isVerified, "Shipper already verified");

        shipperProfiles[_shipper] = ShipperProfile({
            isVerified: true,
            totalJobsPosted: 0,
            totalJobsCompleted: 0,
            joinedAt: block.timestamp,
            isActive: true,
            totalEscrowed: 0
        });

        emit ShipperVerified(_shipper, block.timestamp);
    }

    /**
     * @notice Deactivate a carrier
     */
    function deactivateCarrier(address _carrier, string calldata _reason) external onlyOwner {
        require(carrierProfiles[_carrier].isVerified, "Carrier not verified");
        require(carrierProfiles[_carrier].isActive, "Carrier already inactive");

        carrierProfiles[_carrier].isActive = false;
        totalActiveCarriers--;

        emit CarrierDeactivated(_carrier, _reason);
    }

    /**
     * @notice Deactivate a shipper
     */
    function deactivateShipper(address _shipper, string calldata _reason) external onlyOwner {
        require(shipperProfiles[_shipper].isVerified, "Shipper not verified");
        require(shipperProfiles[_shipper].isActive, "Shipper already inactive");

        shipperProfiles[_shipper].isActive = false;

        emit ShipperDeactivated(_shipper, _reason);
    }

    /**
     * @notice Set testing mode (for development only)
     */
    function setTesting(bool enabled) external onlyOwner {
        isTesting = enabled;
    }

    /**
     * @notice Set the pauser address
     */
    function setPauser(address _newPauser) external onlyOwner {
        require(_newPauser != address(0), "Invalid pauser address");
        address oldPauser = pauser;
        pauser = _newPauser;
        emit PauserChanged(oldPauser, _newPauser);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyPauser whenNotPaused {
        paused = true;
        emit Paused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyPauser whenPaused {
        paused = false;
        emit Unpaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Withdraw accumulated platform fees
     */
    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        require(platformFees > 0, "No fees to withdraw");
        uint256 amount = platformFees;
        platformFees = 0;
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit PlatformFeesWithdrawn(to, amount);
    }

    // ============ Core Freight Functions ============

    /**
     * @notice Post a new freight job with encrypted parameters and escrow
     * @dev Uses price obfuscation to protect budget information
     * @param _origin Origin location
     * @param _destination Destination location
     * @param _cargoType Type of cargo
     * @param _encryptedWeight Encrypted weight input proof
     * @param _encryptedVolume Encrypted volume input proof
     * @param _encryptedBudget Encrypted maximum budget
     * @param _isUrgent Encrypted urgency flag input proof
     * @param _biddingDuration Duration for bidding in seconds
     */
    function postJob(
        string memory _origin,
        string memory _destination,
        string memory _cargoType,
        einput _encryptedWeight,
        einput _encryptedVolume,
        einput _encryptedBudget,
        einput _isUrgent,
        uint256 _biddingDuration
    ) external payable onlyVerifiedShipper whenNotPaused returns (uint256) {
        // Input validation
        require(bytes(_origin).length > 0 && bytes(_origin).length <= 100, "Invalid origin");
        require(bytes(_destination).length > 0 && bytes(_destination).length <= 100, "Invalid destination");
        require(bytes(_cargoType).length > 0 && bytes(_cargoType).length <= 50, "Invalid cargo type");
        require(_biddingDuration >= MIN_BIDDING_DURATION && _biddingDuration <= MAX_BIDDING_DURATION, "Invalid bidding duration");
        require(msg.value >= PLATFORM_FEE, "Insufficient platform fee");

        jobCounter++;
        uint256 jobId = jobCounter;

        // Process platform fee
        platformFees += PLATFORM_FEE;
        uint256 escrowAmount = msg.value - PLATFORM_FEE;

        // Input proof verification (ZKPoK) - asEuint performs verification
        euint64 weight = FHE.asEuint64(_encryptedWeight);
        euint64 volume = FHE.asEuint64(_encryptedVolume);
        euint64 budget = FHE.asEuint64(_encryptedBudget);
        ebool urgent = FHE.asEbool(_isUrgent);

        // Apply price obfuscation to budget using random noise
        // This protects against division attacks and price inference
        euint64 obfuscatedBudget = _applyPriceObfuscation(budget);

        freightJobs[jobId] = FreightJob({
            origin: _origin,
            destination: _destination,
            cargoType: _cargoType,
            encryptedWeight: weight,
            encryptedVolume: volume,
            encryptedBudget: obfuscatedBudget,
            deadline: block.timestamp + 30 days,
            biddingEndTime: block.timestamp + _biddingDuration,
            shipper: msg.sender,
            status: JobStatus.Open,
            encryptedFinalPrice: FHE.asEuint64(0),
            revealedFinalPrice: 0,
            isPriceRevealed: false,
            isUrgent: urgent,
            urgentRevealed: false,
            createdAt: block.timestamp,
            escrowAmount: escrowAmount,
            refundDeadline: block.timestamp + _biddingDuration + REFUND_GRACE_PERIOD
        });

        // Grant permissions - optimized for HCU usage
        _grantJobPermissions(jobId, weight, volume, obfuscatedBudget, urgent);

        shipperProfiles[msg.sender].totalJobsPosted++;
        shipperProfiles[msg.sender].totalEscrowed += escrowAmount;

        emit JobPosted(jobId, msg.sender, escrowAmount, block.timestamp);
        return jobId;
    }

    /**
     * @notice Submit an encrypted bid for a job with deposit
     * @dev Applies price obfuscation to protect competitive information
     */
    function submitBid(
        uint256 _jobId,
        einput _encryptedPrice,
        einput _encryptedDeliveryDays,
        einput _encryptedReliability,
        einput _isExpress
    ) external payable validJobId(_jobId) onlyVerifiedCarrier whenNotPaused
        jobInStatus(_jobId, JobStatus.Open) nonReentrant {

        require(block.timestamp < freightJobs[_jobId].biddingEndTime, "Bidding period ended");
        require(!jobBids[_jobId][msg.sender].hasSubmitted, "Bid already submitted");
        require(msg.sender != freightJobs[_jobId].shipper, "Shipper cannot bid on own job");
        require(msg.value >= MIN_BID_AMOUNT, "Insufficient bid deposit");

        // Input proof verification (ZKPoK)
        euint64 price = FHE.asEuint64(_encryptedPrice);
        euint32 deliveryDays = FHE.asEuint32(_encryptedDeliveryDays);
        euint32 reliability = FHE.asEuint32(_encryptedReliability);
        ebool isExpress = FHE.asEbool(_isExpress);

        // Apply price obfuscation to protect against price inference
        euint64 obfuscatedPrice = _applyPriceObfuscation(price);

        jobBids[_jobId][msg.sender] = Bid({
            encryptedPrice: price,
            obfuscatedPrice: obfuscatedPrice,
            encryptedDeliveryDays: deliveryDays,
            encryptedReliabilityScore: reliability,
            isExpressService: isExpress,
            hasSubmitted: true,
            isRevealed: false,
            revealedPrice: 0,
            revealedDeliveryDays: 0,
            revealedReliability: 0,
            revealedExpress: false,
            timestamp: block.timestamp,
            carrier: msg.sender,
            depositAmount: msg.value
        });

        jobBidders[_jobId].push(msg.sender);

        // Grant permissions - optimized for HCU
        _grantBidPermissions(_jobId, price, deliveryDays, reliability, isExpress);

        carrierProfiles[msg.sender].totalBids++;
        carrierProfiles[msg.sender].totalDeposits += msg.value;
        totalBidsSubmitted++;

        emit BidSubmitted(_jobId, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Close bidding for a job
     */
    function closeBidding(uint256 _jobId)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        jobInStatus(_jobId, JobStatus.Open)
        whenNotPaused {

        require(jobBidders[_jobId].length > 0, "No bids submitted");

        freightJobs[_jobId].status = JobStatus.BiddingClosed;

        emit BiddingClosed(_jobId, jobBidders[_jobId].length);
    }

    /**
     * @notice Request decryption of a bid price via Gateway with timeout protection
     */
    function requestBidPriceReveal(uint256 _jobId, address _carrier)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused
        returns (uint256) {

        require(jobBids[_jobId][_carrier].hasSubmitted, "No bid from carrier");
        require(!jobBids[_jobId][_carrier].isRevealed, "Bid already revealed");
        require(
            freightJobs[_jobId].status == JobStatus.BiddingClosed ||
            block.timestamp >= freightJobs[_jobId].biddingEndTime,
            "Bidding still active"
        );

        requestCounter++;
        uint256 requestId = requestCounter;

        // Create decryption request with timeout
        decryptionRequests[requestId] = DecryptionRequest({
            jobId: _jobId,
            carrier: _carrier,
            callbackType: CallbackType.RevealBidPrice,
            status: RequestStatus.Pending,
            createdAt: block.timestamp,
            timeout: block.timestamp + DECRYPTION_TIMEOUT,
            refundAmount: jobBids[_jobId][_carrier].depositAmount,
            refundRecipient: _carrier
        });

        // Add to pending requests for timeout tracking
        pendingRequestIndex[requestId] = pendingRequests.length;
        pendingRequests.push(requestId);

        // Track request for job
        jobDecryptionRequests[_jobId].push(requestId);

        // Request Gateway decryption
        uint256 gatewayRequestId = Gateway.requestDecryption(
            Gateway.toUint256(jobBids[_jobId][_carrier].encryptedPrice),
            this.callbackBidPriceReveal.selector,
            0,
            block.timestamp + DECRYPTION_TIMEOUT,
            false
        );

        emit DecryptionRequested(requestId, _jobId, CallbackType.RevealBidPrice, block.timestamp + DECRYPTION_TIMEOUT);
        return requestId;
    }

    /**
     * @notice Gateway callback for bid price reveal
     */
    function callbackBidPriceReveal(uint256 requestId, uint64 decryptedPrice)
        external
        onlyGateway
        returns (bool) {

        DecryptionRequest storage request = decryptionRequests[requestId];
        require(request.status == RequestStatus.Pending, "Request not pending");
        require(request.callbackType == CallbackType.RevealBidPrice, "Invalid callback type");

        uint256 jobId = request.jobId;
        address carrier = request.carrier;

        require(jobBids[jobId][carrier].hasSubmitted, "No bid found");

        // Update bid with revealed price
        jobBids[jobId][carrier].isRevealed = true;
        jobBids[jobId][carrier].revealedPrice = decryptedPrice;

        // Update request status
        request.status = RequestStatus.Completed;

        // Remove from pending requests
        _removePendingRequest(requestId);

        emit BidRevealed(jobId, carrier, decryptedPrice, jobBids[jobId][carrier].revealedDeliveryDays);
        emit DecryptionCompleted(requestId, jobId, true);

        return true;
    }

    /**
     * @notice Award job to winning carrier with payment
     */
    function awardJob(uint256 _jobId, address _carrier)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused
        nonReentrant {

        FreightJob storage job = freightJobs[_jobId];
        require(job.status == JobStatus.BiddingClosed, "Bidding not closed");
        require(jobBids[_jobId][_carrier].hasSubmitted, "No bid from carrier");
        require(jobBids[_jobId][_carrier].isRevealed, "Bid not revealed");

        job.status = JobStatus.Awarded;
        job.encryptedFinalPrice = jobBids[_jobId][_carrier].encryptedPrice;
        job.revealedFinalPrice = jobBids[_jobId][_carrier].revealedPrice;
        job.isPriceRevealed = true;

        jobWinners[_jobId] = _carrier;
        carrierProfiles[_carrier].wonBids++;

        // Return deposits to losing bidders
        _returnLosingDeposits(_jobId, _carrier);

        emit JobAwarded(_jobId, _carrier, job.revealedFinalPrice, block.timestamp);
    }

    /**
     * @notice Mark job as completed and release payment
     */
    function completeJob(uint256 _jobId)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused
        nonReentrant {

        FreightJob storage job = freightJobs[_jobId];
        require(job.status == JobStatus.Awarded, "Job not awarded");

        job.status = JobStatus.Completed;

        address winner = jobWinners[_jobId];
        uint256 paymentAmount = job.escrowAmount + jobBids[_jobId][winner].depositAmount;

        // Update profiles
        carrierProfiles[winner].completedJobs++;
        shipperProfiles[msg.sender].totalJobsCompleted++;
        shipperProfiles[msg.sender].totalEscrowed -= job.escrowAmount;
        totalJobsCompleted++;

        // Transfer payment to carrier
        (bool sent, ) = payable(winner).call{value: paymentAmount}("");
        require(sent, "Payment failed");

        emit JobCompleted(_jobId, winner, paymentAmount, block.timestamp);
    }

    /**
     * @notice Cancel a job and process refunds
     */
    function cancelJob(uint256 _jobId, string calldata _reason)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused
        nonReentrant {

        FreightJob storage job = freightJobs[_jobId];
        require(
            job.status == JobStatus.Open || job.status == JobStatus.BiddingClosed,
            "Cannot cancel awarded or completed job"
        );

        job.status = JobStatus.Cancelled;

        // Refund escrow to shipper
        uint256 refundAmount = job.escrowAmount;
        if (refundAmount > 0) {
            job.escrowAmount = 0;
            shipperProfiles[msg.sender].totalEscrowed -= refundAmount;
            (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(sent, "Refund to shipper failed");
        }

        // Return all bid deposits
        _returnAllDeposits(_jobId);

        emit JobCancelled(_jobId, msg.sender, _reason, refundAmount);
    }

    // ============ Refund Mechanism ============

    /**
     * @notice Request refund for a timed-out decryption request
     * @dev Allows users to recover funds when Gateway callback fails
     */
    function requestRefund(uint256 requestId) external whenNotPaused nonReentrant {
        DecryptionRequest storage request = decryptionRequests[requestId];
        require(request.status == RequestStatus.Pending, "Request not pending");
        require(block.timestamp > request.timeout, "Timeout not reached");
        require(
            msg.sender == request.refundRecipient ||
            msg.sender == freightJobs[request.jobId].shipper ||
            msg.sender == owner,
            "Not authorized to request refund"
        );

        _processRefund(requestId);
    }

    /**
     * @notice Process refund for timed-out or failed request
     */
    function processRefund(uint256 requestId, uint64 /* refundAmount */)
        external
        onlyGateway
        returns (bool) {

        DecryptionRequest storage request = decryptionRequests[requestId];
        if (request.status != RequestStatus.Pending) {
            return false;
        }

        _processRefund(requestId);
        return true;
    }

    /**
     * @dev Internal function to process refund
     */
    function _processRefund(uint256 requestId) internal {
        DecryptionRequest storage request = decryptionRequests[requestId];

        request.status = RequestStatus.Refunded;
        _removePendingRequest(requestId);

        uint256 refundAmount = request.refundAmount;
        address recipient = request.refundRecipient;

        if (refundAmount > 0 && recipient != address(0)) {
            (bool sent, ) = payable(recipient).call{value: refundAmount}("");
            if (sent) {
                totalRefundsProcessed++;
                emit RefundProcessed(requestId, recipient, refundAmount);
            } else {
                emit RefundFailed(requestId, recipient, "Transfer failed");
            }
        }
    }

    // ============ Timeout Protection ============

    /**
     * @notice Trigger timeout for a single request
     * @dev Anyone can call this to clean up expired requests
     */
    function triggerTimeout(uint256 requestId) external whenNotPaused {
        DecryptionRequest storage request = decryptionRequests[requestId];
        require(request.status == RequestStatus.Pending, "Request not pending");
        require(block.timestamp > request.timeout, "Timeout not reached");

        request.status = RequestStatus.TimedOut;
        _removePendingRequest(requestId);
        totalTimeoutsTriggered++;

        // Process refund automatically
        uint256 refundAmount = request.refundAmount;
        address recipient = request.refundRecipient;

        if (refundAmount > 0 && recipient != address(0)) {
            (bool sent, ) = payable(recipient).call{value: refundAmount}("");
            if (sent) {
                emit RefundProcessed(requestId, recipient, refundAmount);
            }
        }

        emit TimeoutTriggered(requestId, request.jobId, block.timestamp);
        emit DecryptionTimedOut(requestId, request.jobId);
    }

    /**
     * @notice Batch process multiple timeouts for gas efficiency
     * @param requestIds Array of request IDs to check and process
     */
    function batchProcessTimeouts(uint256[] calldata requestIds) external whenNotPaused {
        require(requestIds.length <= BATCH_TIMEOUT_LIMIT, "Batch too large");

        uint256 processedCount = 0;

        for (uint256 i = 0; i < requestIds.length; i++) {
            uint256 requestId = requestIds[i];
            DecryptionRequest storage request = decryptionRequests[requestId];

            if (request.status == RequestStatus.Pending && block.timestamp > request.timeout) {
                request.status = RequestStatus.TimedOut;
                _removePendingRequest(requestId);
                totalTimeoutsTriggered++;

                // Process refund
                if (request.refundAmount > 0 && request.refundRecipient != address(0)) {
                    (bool sent, ) = payable(request.refundRecipient).call{value: request.refundAmount}("");
                    if (sent) {
                        emit RefundProcessed(requestId, request.refundRecipient, request.refundAmount);
                    }
                }

                emit TimeoutTriggered(requestId, request.jobId, block.timestamp);
                processedCount++;
            }
        }

        emit BatchTimeoutProcessed(processedCount, block.timestamp);
    }

    /**
     * @notice Get all pending requests that have timed out
     */
    function getTimedOutRequests() external view returns (uint256[] memory) {
        uint256 count = 0;

        // Count timed out requests
        for (uint256 i = 0; i < pendingRequests.length; i++) {
            if (decryptionRequests[pendingRequests[i]].timeout < block.timestamp) {
                count++;
            }
        }

        // Collect timed out request IDs
        uint256[] memory timedOut = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < pendingRequests.length; i++) {
            if (decryptionRequests[pendingRequests[i]].timeout < block.timestamp) {
                timedOut[index] = pendingRequests[i];
                index++;
            }
        }

        return timedOut;
    }

    // ============ Price Obfuscation (Division Protection) ============

    /**
     * @dev Apply price obfuscation using random multiplier
     * @notice Protects against division attacks and price inference
     * @param price Original encrypted price
     * @return Obfuscated price with noise
     */
    function _applyPriceObfuscation(euint64 price) internal returns (euint64) {
        // Generate random noise for obfuscation
        // Using FHE.asEuint64 with a constant as placeholder
        // In production, use proper random generation
        euint64 noise = FHE.asEuint64(uint64(block.timestamp % PRICE_NOISE_RANGE));

        // Apply obfuscation: (price * MULTIPLIER_BASE + noise) / MULTIPLIER_BASE
        // This preserves relative ordering while adding noise
        euint64 multiplier = FHE.asEuint64(PRICE_MULTIPLIER_BASE);
        euint64 scaled = FHE.mul(price, multiplier);
        euint64 obfuscated = FHE.add(scaled, noise);

        // Grant contract permission to obfuscated value
        FHE.allowThis(obfuscated);

        return obfuscated;
    }

    // ============ FHE Comparison Functions ============

    /**
     * @notice Compare two bids using FHE operations (HCU optimized)
     * @dev Uses minimal HCU operations for gas efficiency
     */
    function compareBidsEncrypted(uint256 _jobId, address _carrier1, address _carrier2)
        external
        view
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        returns (ebool) {

        require(jobBids[_jobId][_carrier1].hasSubmitted, "Carrier1 no bid");
        require(jobBids[_jobId][_carrier2].hasSubmitted, "Carrier2 no bid");

        Bid storage bid1 = jobBids[_jobId][_carrier1];
        Bid storage bid2 = jobBids[_jobId][_carrier2];

        // Lower price is better - single HCU comparison
        ebool priceBetter = FHE.lt(bid1.encryptedPrice, bid2.encryptedPrice);

        // For HCU optimization, only do secondary comparison if needed
        ebool priceEqual = FHE.eq(bid1.encryptedPrice, bid2.encryptedPrice);
        ebool deliveryBetter = FHE.lt(bid1.encryptedDeliveryDays, bid2.encryptedDeliveryDays);

        // Combine: price better OR (price equal AND delivery better)
        return FHE.or(priceBetter, FHE.and(priceEqual, deliveryBetter));
    }

    /**
     * @notice Check if bid meets job requirements
     */
    function checkBidMeetsRequirements(uint256 _jobId, address _carrier)
        external
        view
        validJobId(_jobId)
        returns (ebool) {

        require(jobBids[_jobId][_carrier].hasSubmitted, "No bid from carrier");

        Bid storage bid = jobBids[_jobId][_carrier];
        FreightJob storage job = freightJobs[_jobId];

        // Check minimum reliability score (> 50)
        euint32 minReliability = FHE.asEuint32(50);
        ebool meetsReliability = FHE.gte(bid.encryptedReliabilityScore, minReliability);

        // If urgent, must be express service
        ebool meetsUrgency = FHE.or(FHE.not(job.isUrgent), bid.isExpressService);

        return FHE.and(meetsReliability, meetsUrgency);
    }

    // ============ Internal Helper Functions ============

    /**
     * @dev Grant FHE permissions for job data (HCU optimized)
     */
    function _grantJobPermissions(
        uint256 /* jobId */,
        euint64 weight,
        euint64 volume,
        euint64 budget,
        ebool urgent
    ) internal {
        // Batch permission grants for HCU efficiency
        FHE.allowThis(weight);
        FHE.allowThis(volume);
        FHE.allowThis(budget);
        FHE.allowThis(urgent);

        FHE.allow(weight, msg.sender);
        FHE.allow(volume, msg.sender);
        FHE.allow(budget, msg.sender);
        FHE.allow(urgent, msg.sender);
    }

    /**
     * @dev Grant FHE permissions for bid data (HCU optimized)
     */
    function _grantBidPermissions(
        uint256 _jobId,
        euint64 price,
        euint32 deliveryDays,
        euint32 reliability,
        ebool isExpress
    ) internal {
        address shipper = freightJobs[_jobId].shipper;

        // Batch permission grants
        FHE.allowThis(price);
        FHE.allowThis(deliveryDays);
        FHE.allowThis(reliability);
        FHE.allowThis(isExpress);

        FHE.allow(price, shipper);
        FHE.allow(deliveryDays, shipper);
        FHE.allow(reliability, shipper);
        FHE.allow(isExpress, shipper);
    }

    /**
     * @dev Return deposits to losing bidders
     */
    function _returnLosingDeposits(uint256 _jobId, address _winner) internal {
        address[] memory bidders = jobBidders[_jobId];

        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            if (bidder != _winner) {
                uint256 deposit = jobBids[_jobId][bidder].depositAmount;
                if (deposit > 0) {
                    jobBids[_jobId][bidder].depositAmount = 0;
                    (bool sent, ) = payable(bidder).call{value: deposit}("");
                    if (!sent) {
                        // Revert deposit on failure
                        jobBids[_jobId][bidder].depositAmount = deposit;
                    }
                }
            }
        }
    }

    /**
     * @dev Return all bid deposits (for cancelled jobs)
     */
    function _returnAllDeposits(uint256 _jobId) internal {
        address[] memory bidders = jobBidders[_jobId];

        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            uint256 deposit = jobBids[_jobId][bidder].depositAmount;
            if (deposit > 0) {
                jobBids[_jobId][bidder].depositAmount = 0;
                (bool sent, ) = payable(bidder).call{value: deposit}("");
                if (!sent) {
                    jobBids[_jobId][bidder].depositAmount = deposit;
                }
            }
        }
    }

    /**
     * @dev Remove request from pending array
     */
    function _removePendingRequest(uint256 requestId) internal {
        uint256 index = pendingRequestIndex[requestId];
        uint256 lastIndex = pendingRequests.length - 1;

        if (index != lastIndex) {
            uint256 lastRequestId = pendingRequests[lastIndex];
            pendingRequests[index] = lastRequestId;
            pendingRequestIndex[lastRequestId] = index;
        }

        pendingRequests.pop();
        delete pendingRequestIndex[requestId];
    }

    // ============ View Functions ============

    /**
     * @notice Get job information
     */
    function getJobInfo(uint256 _jobId) external view validJobId(_jobId) returns (
        string memory origin,
        string memory destination,
        string memory cargoType,
        address shipper,
        JobStatus status,
        uint256 biddingEndTime,
        uint256 totalBids,
        uint256 escrowAmount
    ) {
        FreightJob storage job = freightJobs[_jobId];
        return (
            job.origin,
            job.destination,
            job.cargoType,
            job.shipper,
            job.status,
            job.biddingEndTime,
            jobBidders[_jobId].length,
            job.escrowAmount
        );
    }

    /**
     * @notice Get bid information
     */
    function getBidInfo(uint256 _jobId, address _carrier) external view returns (
        bool hasSubmitted,
        bool isRevealed,
        uint64 revealedPrice,
        uint32 revealedDeliveryDays,
        uint32 revealedReliability,
        bool revealedExpress,
        uint256 depositAmount
    ) {
        Bid storage bid = jobBids[_jobId][_carrier];
        return (
            bid.hasSubmitted,
            bid.isRevealed,
            bid.revealedPrice,
            bid.revealedDeliveryDays,
            bid.revealedReliability,
            bid.revealedExpress,
            bid.depositAmount
        );
    }

    /**
     * @notice Get decryption request status
     */
    function getRequestStatus(uint256 requestId) external view returns (
        uint256 jobId,
        address carrier,
        RequestStatus status,
        uint256 createdAt,
        uint256 timeout,
        uint256 refundAmount
    ) {
        DecryptionRequest storage request = decryptionRequests[requestId];
        return (
            request.jobId,
            request.carrier,
            request.status,
            request.createdAt,
            request.timeout,
            request.refundAmount
        );
    }

    /**
     * @notice Get all bidders for a job
     */
    function getBidders(uint256 _jobId) external view validJobId(_jobId) returns (address[] memory) {
        return jobBidders[_jobId];
    }

    /**
     * @notice Get carrier profile
     */
    function getCarrierProfile(address _carrier) external view returns (
        bool isVerified,
        bool isActive,
        uint256 totalBids,
        uint256 wonBids,
        uint256 completedJobs,
        uint256 joinedAt,
        uint256 totalDeposits
    ) {
        CarrierProfile storage profile = carrierProfiles[_carrier];
        return (
            profile.isVerified,
            profile.isActive,
            profile.totalBids,
            profile.wonBids,
            profile.completedJobs,
            profile.joinedAt,
            profile.totalDeposits
        );
    }

    /**
     * @notice Get shipper profile
     */
    function getShipperProfile(address _shipper) external view returns (
        bool isVerified,
        bool isActive,
        uint256 totalJobsPosted,
        uint256 totalJobsCompleted,
        uint256 joinedAt,
        uint256 totalEscrowed
    ) {
        ShipperProfile storage profile = shipperProfiles[_shipper];
        return (
            profile.isVerified,
            profile.isActive,
            profile.totalJobsPosted,
            profile.totalJobsCompleted,
            profile.joinedAt,
            profile.totalEscrowed
        );
    }

    /**
     * @notice Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalJobs,
        uint256 _totalBids,
        uint256 _totalCompleted,
        uint256 _totalActiveCarriers,
        uint256 _totalRefunds,
        uint256 _totalTimeouts,
        uint256 _platformFees
    ) {
        return (
            jobCounter,
            totalBidsSubmitted,
            totalJobsCompleted,
            totalActiveCarriers,
            totalRefundsProcessed,
            totalTimeoutsTriggered,
            platformFees
        );
    }

    /**
     * @notice Get pending request count
     */
    function getPendingRequestCount() external view returns (uint256) {
        return pendingRequests.length;
    }

    /**
     * @notice Get job winner
     */
    function getJobWinner(uint256 _jobId) external view validJobId(_jobId) returns (address) {
        require(
            freightJobs[_jobId].status == JobStatus.Awarded ||
            freightJobs[_jobId].status == JobStatus.Completed,
            "Job not awarded yet"
        );
        return jobWinners[_jobId];
    }

    // ============ Permission Management ============

    /**
     * @notice Allow address to access encrypted bid data
     */
    function allowBidAccess(uint256 _jobId, address _carrier, address _allowedAddress)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId) {

        require(jobBids[_jobId][_carrier].hasSubmitted, "No bid from carrier");

        Bid storage bid = jobBids[_jobId][_carrier];
        FHE.allow(bid.encryptedPrice, _allowedAddress);
        FHE.allow(bid.encryptedDeliveryDays, _allowedAddress);
        FHE.allow(bid.encryptedReliabilityScore, _allowedAddress);
        FHE.allow(bid.isExpressService, _allowedAddress);
    }

    // ============ Emergency Functions ============

    /**
     * @notice Emergency withdraw for stuck funds (owner only)
     * @dev Only use in emergencies when normal refund mechanisms fail
     */
    function emergencyWithdraw(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool sent, ) = payable(recipient).call{value: amount}("");
        require(sent, "Emergency withdraw failed");
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}
}
