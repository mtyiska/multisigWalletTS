pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletContract {
  /*
   *  Events
   */
  event WalletCreated(
    uint256 indexed eventId,
    uint256 indexed walletId,
    string walletName,
    uint256 createdTime,
    uint256 numberOfOwners,
    address walletOwners,
    uint256 walletBalance
  );
  event WalletFunded(uint256 indexed eventId, uint256 indexed walletId, uint256 timeStamp, uint256 fundedAmount, address sender, uint256 walletBalance);
  event TransactionCreated(uint256 indexed eventId, uint256 indexed transactionId, Status status);
  event Deposit(uint256 indexed eventId, address indexed sender, uint256 value, uint256 timeStamp);

  /*
   *  Constants
   */
  uint256 public constant MAX_OWNER_COUNT = 10;

  enum Status {
    Pending,
    Verified,
    Accepted,
    Rejected,
    Canceled,
    Complete
  }

  /**Structs */
  struct Transaction {
    address destination;
    uint256 value;
    Status status;
    string walletName;
    uint256 walletId;
  }

  struct Wallet {
    uint256 walletId;
    string walletName;
    uint256 createdTime;
    uint256 numberOfOwners;
    uint256 walletBalance;
  }

  /*
   *  Storage
   */
  mapping(uint256 => Transaction) private idToTransactions;
  mapping(uint256 => Wallet) private idToWallet;
  mapping(string => uint256) private nameToWallet;
  mapping(address => bool) private isOwner;
  mapping(uint256 => mapping(uint256 => address)) private walletOwners;
  mapping(string => bool) private doesNameExist;

  /**Counters */
  using Counters for Counters.Counter;
  using ECDSA for bytes32;
  Counters.Counter private transactionCount;
  Counters.Counter private _walletIds;
  Counters.Counter private _eventIds;

  constructor() {
    // what should we do on deploy?
    console.log("deploying Multisig");
  }

  /**createWallet*/
  function createWallet(string memory _walletName, address _adr) public validRequirement(1, 1) returns (uint256 walletId) {
    address _walletOwners = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
    console.log("is address the same =>>", keccak256(abi.encodePacked(_adr)) == keccak256(abi.encodePacked(_walletOwners)));

    for (uint256 i = 0; i < 1; i++) {
      require(!isOwner[_walletOwners] && (uint256(uint160(address(_walletOwners)))) != 0);
      isOwner[_walletOwners] = true;
    }
    require(!doesNameExist[_walletName], "Name Already Exists");
    _walletIds.increment();

    walletId = _walletIds.current();
    idToWallet[walletId] = Wallet({ walletName: _walletName, walletId: walletId, walletBalance: 0, numberOfOwners: 1, createdTime: block.timestamp });
    nameToWallet[_walletName] = walletId;
    _walletIds.increment();
    _eventIds.increment();

    for (uint256 i = 0; i < 1; i++) {
      walletOwners[walletId][i] = _walletOwners;
    }
    emit WalletCreated(
      _eventIds.current(),
      idToWallet[walletId].walletId,
      idToWallet[walletId].walletName,
      idToWallet[walletId].createdTime,
      idToWallet[walletId].numberOfOwners,
      _walletOwners,
      idToWallet[walletId].walletBalance
    );
    return walletId;
  }

  /**fetchMyWallets */
  function fetchMyWallets() public view returns (Wallet[] memory) {
    uint256 totalItemCount = _walletIds.current();
    /**variable to track length of arrays for my items */
    uint256 itemCount = 0;
    /**current index for array of my items */
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      /**if i own the item */

      if (walletOwners[i + 1][i] == msg.sender) {
        itemCount += 1;
      }
    }

    Wallet[] memory items = new Wallet[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (walletOwners[i + 1][i] == msg.sender) {
        uint256 walletId = i + 1;
        Wallet storage currentItem = idToWallet[walletId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function fetchWalletInfo(uint256 walletId) public view returns (Wallet memory) {
    return idToWallet[walletId];
  }

  function fetchWalletIdByName(string memory walletName) public view returns (uint256) {
    return nameToWallet[walletName];
  }

  function fetchWalletOwners(uint256 walletId) public view returns (address[] memory) {
    address[] memory items = new address[](idToWallet[walletId].numberOfOwners);
    for (uint256 i = 0; i < idToWallet[walletId].numberOfOwners; i++) {
      items[i] = walletOwners[walletId][i];
    }
    return items;
  }

  function fetchWalletBalance(uint256 walletId) public view returns (uint256) {
    return idToWallet[walletId].walletBalance;
  }

  /**fundWallet */
  function fundWallet(uint256 walletId) public payable returns (bool) {
    require(msg.value > 0, "Price must be at least 1 wei");
    idToWallet[walletId].walletBalance += msg.value;
    _eventIds.increment();
    uint256 updatedBalance = idToWallet[walletId].walletBalance;

    emit WalletFunded(_eventIds.current(), walletId, block.timestamp, msg.value, msg.sender, updatedBalance);
    return true;
  }

  /// @dev Fallback function allows to deposit ether.
  receive() external payable {
    if (msg.value > 0) {
      _eventIds.increment();
      emit Deposit(_eventIds.current(), msg.sender, msg.value, block.timestamp);
    }
  }

  //   / @dev Allows an owner to submit a transaction request.
  //   / @param destination Transaction target address.
  //   / @param value Transaction ether value.
  //   / @param data Transaction data payload.
  //   / @return Returns transaction ID.
  function requestTransaction(
    address _destination,
    string memory _walletName,
    uint256 _value
  ) public returns (uint256) {
    uint256 transactionId = addTransaction(_destination, _walletName, _value);
    return transactionId;
  }

  /*
   * Internal functions
   */
  //   / @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
  //   / @param destination Transaction target address.
  //   / @param value Transaction ether value.
  //   / @param data Transaction data payload.
  //   / @return Returns transaction ID.
  //
  function addTransaction(
    address _destination,
    string memory _walletName,
    uint256 _value
  ) internal notNull(_destination, _walletName, _value) returns (uint256) {
    uint256 transactionId = transactionCount.current();
    idToTransactions[transactionId] = Transaction({
      destination: _destination,
      value: _value,
      status: Status.Pending,
      walletName: _walletName,
      walletId: nameToWallet[_walletName]
    });
    _eventIds.increment();
    emit TransactionCreated(_eventIds.current(), transactionId, idToTransactions[transactionId].status);
    transactionCount.increment();
    return transactionId;
  }

  function filterMyTransactions(uint256 _walletId, Status _status) public view returns (Transaction[] memory) {
    /**
    get all transactions
    filter where wallet Id is my wallet
    filter where all my wallet is status
     */
    string memory walletName = idToWallet[_walletId].walletName;
    Transaction[] memory myTransactions = new Transaction[](transactionCount.current());
    uint256 count = 0;
    for (uint256 i = 0; i < transactionCount.current(); i++) {
      if (keccak256(abi.encodePacked(idToTransactions[i].walletName)) == keccak256(abi.encodePacked(walletName))) {
        Transaction memory name = idToTransactions[i];
        myTransactions[count] = name;
        count += 1;
      }
    }

    uint256 currentIndex = 0;
    Transaction[] memory items = new Transaction[](count);
    for (uint256 i = 0; i < myTransactions.length; i++) {
      if (myTransactions[i].status == _status) {
        Transaction memory currentItem = myTransactions[i];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function getContractAddress() public view returns (address) {
    return address(this);
  }

  function getContractBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function verifyMessage(
    uint256 _withdrawAmount,
    bytes memory _sig,
    uint256 _walletId,
    uint256 _transactionId,
    address _address
  ) public returns (address) {
    idToTransactions[_transactionId] = Transaction({
      destination: _address,
      value: _withdrawAmount,
      status: Status.Accepted,
      walletName: idToWallet[_walletId].walletName,
      walletId: _walletId
    });
    bytes32 message = keccak256(abi.encodePacked(_withdrawAmount, _address));
    address signeraddress = message.toEthSignedMessageHash().recover(_sig);
    address adr = message.toEthSignedMessageHash().recover(_sig);
    console.log("address is", adr);
    if (walletOwners[_walletId][0] == signeraddress) {
      withdraw(_withdrawAmount, _walletId, _transactionId, _address);
    }
    return adr;
  }

  /**withdraw */
  function withdraw(
    uint256 _withdrawAmount,
    uint256 _walletId,
    uint256 _transactionId,
    address _address
  ) internal returns (bool) {
    require(address(this).balance > _withdrawAmount);
    uint256 walletBalance = idToWallet[_walletId].walletBalance;
    require(_withdrawAmount <= walletBalance, "Not enough funds to withdraw");
    idToWallet[_walletId].walletBalance -= _withdrawAmount;
    (bool sent, ) = _address.call{ value: _withdrawAmount }("");
    require(sent, "Failed to withdraw");
    console.log("Sending funds", _withdrawAmount);
    console.log("To user", _address);
    idToTransactions[_transactionId] = Transaction({
      destination: _address,
      value: _withdrawAmount,
      status: Status.Complete,
      walletName: idToWallet[_walletId].walletName,
      walletId: _walletId
    });

    return true;
  }

  /**Modifiers */

  modifier notNull(
    address _address,
    string memory walletname,
    uint256 value
  ) {
    require((uint256(uint160(address(_address)))) != 0);
    require(bytes(walletname).length > 0);
    require(value > 0);
    _;
  }

  modifier validRequirement(uint256 ownerCount, uint256 _required) {
    require(ownerCount <= MAX_OWNER_COUNT && _required <= ownerCount && _required != 0 && ownerCount != 0);
    _;
  }
}
