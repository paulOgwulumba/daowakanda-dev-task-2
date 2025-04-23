import { 
  abimethod, 
  assert,
  Asset,
  Contract, 
  GlobalState, 
  uint64, 
  Global, 
  itxn, 
  gtxn, 
  Txn,
} from '@algorandfoundation/algorand-typescript';

export class AssetDistributor extends Contract {
  assetId = GlobalState<uint64>();

  @abimethod({ onCreate: 'require' })
  public createApplication() {}

  public bootstrap(mbrTxn: gtxn.PaymentTxn, assetId: uint64): void {
    assert(mbrTxn.amount >= 200_000, 'Minimum balance must be at least 0.2 algos');
    assert(mbrTxn.receiver === Global.currentApplicationAddress);
    assert(Txn.sender === Global.creatorAddress);

    itxn.assetTransfer({
      assetAmount: 0,
      assetReceiver: Global.currentApplicationAddress,
      xferAsset: assetId,
    }).submit();

    this.assetId.value = assetId;
  }

  /**
   * This completes a buy transaction for the asset.
   * @param paymentTxn The transaction that pays for the asset.
   * The transaction has the following constraints: 
   *  - The amount must be 2000 microalgos or 0.02 algos.
   *  - The fee must be 2000 microalgos or 0.02 algos.
   */
  @abimethod()
  public buyListing(paymentTxn: gtxn.PaymentTxn): void {
    assert(Txn.sender.isOptedIn(Asset(this.assetId.value)));
    assert(paymentTxn.receiver === Global.currentApplicationAddress);
    assert(paymentTxn.sender === Txn.sender);
    assert(Asset(this.assetId.value).balance(Txn.sender) === 0);
    assert(paymentTxn.amount === 2_000);
    assert(paymentTxn.fee === 2_000);

    itxn.assetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: 1,
      assetReceiver: Txn.sender,
    }).submit();
  }

  /**
   * This withdraws all the earnings of the smart contract
   */
  @abimethod()
  public withdrawEarnings(): void {
    assert(Txn.sender === Global.creatorAddress);
    const appBalanceToSend: uint64 = Global.currentApplicationAddress.balance - 200_000;
    assert(appBalanceToSend > 0);

    itxn.payment({
      receiver: Txn.sender,
      amount: appBalanceToSend,
    }).submit()
  }

  @abimethod({ allowActions: 'DeleteApplication' })
  deleteApplication() {
    assert(Txn.sender === Global.creatorAddress);
    
    if (this.assetId.hasValue) {
      assert(Txn.sender.isOptedIn(Asset(this.assetId.value)));

      itxn.assetTransfer({
        assetAmount: 0,
        assetCloseTo: Global.creatorAddress,
        xferAsset: this.assetId.value,
        assetReceiver: Global.creatorAddress,
      }).submit();
    }

    itxn.payment({
      receiver: Txn.sender,
      amount: 0,
      closeRemainderTo: Global.creatorAddress,
    }).submit()
  }
}
