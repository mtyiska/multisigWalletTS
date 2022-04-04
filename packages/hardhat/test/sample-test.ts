import { ethers, network } from "hardhat";
import { use, expect } from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber } from "ethers";


use(solidity);

describe("My Dapp", function () {
  let multisigWallet: any;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  beforeEach(async function () {
    const MultiSigWalletContract = await ethers.getContractFactory("MultiSigWalletContract");    
    multisigWallet = await MultiSigWalletContract.deploy();
    console.log('\t'," 🔨 Deploying...")
  });

  it("Should create wallet", async () =>{
    const [owner, secondOwner ] = await ethers.getSigners();
    const adr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const tx = await multisigWallet.createWallet(
      "MyWallet Name",
      adr);
    const result =  await tx.wait();
    const walletEvent = result.events.find((e:any) => e.event === 'WalletCreated');
    const [
      eventId,
      walletId,
      walletName,
      createdTime,
      numberOfOwners,
      walletOwners,
      walletBalance
    ] = Object.values(walletEvent.args)
    

    // const wallettById = await multisigWallet.connect(owner).fetchWalletInfo(walletId);
    // console.log(wallettById)

    // const returnWalletOwners = await multisigWallet.connect(owner).fetchWalletOwners(walletId);
    // console.log(returnWalletOwners)

    const myWallets = await multisigWallet.connect(owner).fetchMyWallets(); 
    expect(Object.keys(myWallets).length)
    .to.be.equal(1);

  });

 


  // it("Should fund wallet", async () =>{
  //   const [owner, secondOwner ] = await ethers.getSigners();
  //   const tx = await multisigWallet.createWallet(
  //     "MyWallet Name",
  //     [owner.address, secondOwner.address],
  //     2);
  //   const result =  await tx.wait();
  //   const walletEvent = result.events.find((e:any) => e.event === 'WalletCreated');
  //   const [
  //     eventId,
  //     walletId,
  //     walletName,
  //     createdTime,
  //     numberOfOwners,
  //     walletOwners,
  //     walletBalance
  //   ] = Object.values(walletEvent.args)
    

  //   const fndWallet = await multisigWallet.connect(owner).fundWallet(walletId, { value: ethers.utils.parseEther('1.0')});
  //   const walletFunded =  await fndWallet.wait();
  //   const FunedEvent = walletFunded.events.find((e:any) => e.event === 'WalletFunded');
  //   const [
  //     fundedEventId,
  //     fundedWalletId,
  //     fundedTime,
  //     fundedAmount,
  //     funder,
  //     newBalance
  //   ] = Object.values(FunedEvent.args)

  //   expect(newBalance).to.be.equal(ethers.utils.parseEther('1.0'));

  // });


  // it("Should request Transaction", async () =>{
    //   const [owner, secondOwner ] = await ethers.getSigners();
    //   const tx = await multisigWallet.createWallet(
    //     "MyWallet Name",
    //     [owner.address, secondOwner.address],
    //     2);
    //   const result =  await tx.wait();
    //   const walletEvent = result.events.find((e:any) => e.event === 'WalletCreated');
    //   const [
    //     eventId,
    //     walletId,
    //     walletName,
    //     createdTime,
    //     numberOfOwners,
    //     walletOwners,
    //     walletBalance
    //   ] = Object.values(walletEvent.args)
      
  
    //   const fndWallet = await multisigWallet.connect(owner).fundWallet(walletId, { value: ethers.utils.parseEther('1.0')});
    //   const walletFunded =  await fndWallet.wait();
    //   const FunedEvent = walletFunded.events.find((e:any) => e.event === 'WalletFunded');
    //   const [
    //     fundedEventId,
    //     fundedWalletId,
    //     fundedTime,
    //     fundedAmount,
    //     funder,
    //     newBalance
    //   ] = Object.values(FunedEvent.args)
  
    //   expect(newBalance).to.be.equal(ethers.utils.parseEther('1.0'));
  
    // });

    // it("Should create Transaction", async () =>{
    //   const [owner, secondOwner ] = await ethers.getSigners();
    //   const tx = await multisigWallet.createWallet(
    //     "MyWallet Name",
    //     [owner.address, secondOwner.address],
    //     2);
    //   const result =  await tx.wait();
    //   const walletEvent = result.events.find((e:any) => e.event === 'WalletCreated');
    //   const [
    //     eventId,
    //     walletId,
    //     walletName,
    //     createdTime,
    //     numberOfOwners,
    //     walletOwners,
    //     walletBalance
    //   ] = Object.values(walletEvent.args)

    //   const transaction = await multisigWallet.requestTransaction(
    //     secondOwner.address,
    //     walletName.toString(),
    //     2
    //     );
    //   const requested =  await transaction.wait();

    //   const txEvent = requested.events.find((e:any) => e.event === 'TransactionCreated');
    //   const [
    //     txeventId,
    //     txId,
    //   ] = Object.values(txEvent.args)

  
    //   const ids = await multisigWallet.connect(owner).filterMyTransactions(0,walletId);
    //   expect(ids[0]).to.be.equal(0);
    //   console.log(await multisigWallet.connect(owner).getContractAddress())
  
    // });
  
    // it("Should verify", async () =>{
    //   const [owner, secondOwner ] = await ethers.getSigners();
    //   const tx = await multisigWallet.createWallet(
    //     "MyWallet Name",
    //     [owner.address, secondOwner.address],
    //     2);
    //   const result =  await tx.wait();
    //   const walletEvent = result.events.find((e:any) => e.event === 'WalletCreated');
    //   const [
    //     eventId,
    //     walletIdEvents,
    //     walletName,
    //     createdTime,
    //     numberOfOwners,
    //     walletOwners,
    //     walletBalance
    //   ] = Object.values(walletEvent.args)

    //   const transaction = await multisigWallet.requestTransaction(
    //     secondOwner.address,
    //     walletName.toString(),
    //     2
    //     );
    //   const requested =  await transaction.wait();

    //   const txEvent = requested.events.find((e:any) => e.event === 'TransactionCreated');
    //   const [
    //     txeventId,
    //     txId,
    //   ] = Object.values(txEvent.args)
    
    //   const num = 2;
    //   const hash = ethers.utils.solidityKeccak256(['uint256'], [num]);
    //   const signature = await owner.signMessage(ethers.utils.arrayify(hash));
    //   const address = await owner.getAddress();

    //   console.log(`signature: ${signature}`);
    //   console.log(`signer public key: ${address}`);
    //   const walletId = await multisigWallet.fetchWalletIdByName("MyWallet Name");
    //   const verify = await multisigWallet.verifyMessage(num,signature, walletId);
  
    //   // const ids = await multisigWallet.connect(owner).filterMyTransactions(0,walletId);
    //   // expect(ids[0]).to.be.equal(0);
    //   // await verify.wait();

    // });

    // it("Should verify and withdraw", async () =>{
    //   const [owner, secondOwner ] = await ethers.getSigners();



    //   /**Create Wallet */
    //   const tx = await multisigWallet.createWallet(
    //     "MyWallet Name",
    //     [owner.address, secondOwner.address],
    //     2);
    //   const result =  await tx.wait();
    //   const walletEvent = result.events.find((e:any) => e.event === 'WalletCreated');
    //   const [
    //     eventId,
    //     walletIdEvents,
    //     walletName,
    //     createdTime,
    //     numberOfOwners,
    //     walletOwners,
    //     walletBalanceEvent
    //   ] = Object.values(walletEvent.args)

    //   const initialBalance = await multisigWallet.fetchWalletBalance(walletIdEvents);
    //   console.log("Initial Balance",initialBalance);

    //   /**Fund Account */
    //   const FundTx = await multisigWallet.fundWallet(walletIdEvents, { value: ethers.utils.parseEther('10.0')});
    //   const fundResult =  await FundTx.wait();
    //   const fundedBalance = await multisigWallet.fetchWalletBalance(walletIdEvents);
    //   console.log("Balance After Funded",fundedBalance);


    //   /**Request Transaction */
    //   const transaction = await multisigWallet.requestTransaction(
    //     secondOwner.address,
    //     walletName,
    //     2
    //     );
    //   const requested =  await transaction.wait();
    //   const txEvent = requested.events.find((e:any) => e.event === 'TransactionCreated');
    //   const [
    //     txeventId,
    //     txId,
    //     status
    //   ] = Object.values(txEvent.args)
    //   console.log("transaction created status is", status);

    // /**
    // Pending,=0
    // Verified=1,
    // Accepted=2,
    // Rejected=3,
    // Canceled=4,
    // Complete=5 
    // */
    // let ids = await multisigWallet.connect(owner).filterMyTransactions(walletIdEvents,0);
    // console.log("all my filtered Pending transactions", ids)
    

    //   /**Verify Transaction */
    //   const num = 2;
    //   const hash = ethers.utils.solidityKeccak256(['uint256'], [num]);
    //   const signature = await owner.signMessage(ethers.utils.arrayify(hash));

    //   ids = await multisigWallet.connect(owner).filterMyTransactions(walletIdEvents,2);
    //   console.log("all my filtered Accepted transactions", ids)
      
    //   // const address = await owner.getAddress();
    //   // console.log(`signature: ${signature}`);
    //   // console.log(`signer public key: ${address}`);
    //   const walletId = await multisigWallet.fetchWalletIdByName("MyWallet Name");
    //   await multisigWallet.verifyMessage(num,signature, walletId, txId);

    //   ids = await multisigWallet.connect(owner).filterMyTransactions(walletIdEvents,1);
    //   console.log("all my filtered Verified transactions", ids)


    //   /**Get Balance after Withdraw */
    //   const walletBalance = await multisigWallet.fetchWalletBalance(walletId);
    //   console.log("Balance after Withdraw",walletBalance);

    //   /**Pending,
    // Verified,
    // Accepted,
    // Rejected,
    // Canceled,
    // Complete */
    //   ids = await multisigWallet.connect(owner).filterMyTransactions(walletIdEvents,5);
    //   console.log("all my filtered Completed transactions", ids)
      
    // });
    
    // it("should create signature", async ()=>{
    //   const [owner, secondOwner ] = await ethers.getSigners();
    //   const amount = ethers.utils.parseEther('10.0');
    //   const address = ethers.utils.getAddress("0x13BFCC4Cb9ABAF19cDae161DA135922487bA805f");
    //   const hash = ethers.utils.solidityKeccak256(['uint256', 'address'], [amount, address]);
    //   const signature = await owner.signMessage(ethers.utils.arrayify(hash));
    //   console.log("Signature is ", signature);
    // });
  

  
});
