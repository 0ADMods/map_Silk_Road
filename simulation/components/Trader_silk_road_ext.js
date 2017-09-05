Trader.prototype.SetTargetMarkets = function(targets, source) // HACKITY (should be able to set this nicely by adding more if we want to; dunno how to do that in the gui without only working for rallypoints)
{
	if (source)
	{
		// Establish a trade route with both markets in one go.
		let cmpSourceMarket = QueryMiragedInterface(source, IID_Market);
		if (!cmpSourceMarket)
			return false;
		this.markets = [source];
	}

	for (let target of targets)
	{
		let cmpTargetMarket = QueryMiragedInterface(target, IID_Market);
		if (!cmpTargetMarket)
			continue;

		this.markets.push(target);
	}

	if (this.markets.length < 2) {
		warn("failed to do something sane, needs better checks");
		return false;
	}

	this.index = 0;
	let cmpTargetMarket = QueryMiragedInterface(this.markets[0], IID_Market);
	cmpTargetMarket.AddTrader(this.entity);
	this.goods.amount = this.CalculateGain(this.markets[0], this.markets[1]); // TODO hacky as we can't call this function twice after having moved somewhere due to this (really, should reset everything and work)
	let cmpPlayer = QueryOwnerInterface(this.entity);
	this.goods.type = cmpPlayer.GetNextTradingGoods();
	return true;
};

Trader.prototype.GenerateResources = function(currentMarket, nextMarket)
{
	this.AddResources(currentMarket, this.goods.amount.traderGain);

	if (this.goods.amount.market1Gain)
		this.AddResources(currentMarket, this.goods.amount.market1Gain);

	if (this.goods.amount.market2Gain)
		this.AddResources(currentMarket, this.goods.amount.market2Gain);
};
