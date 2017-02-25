UnitAI.prototype.SetupTradeRoute_ = function(targets, source, /*routes?, */queued)
{
	// TODO check if targets are valid markets, if not drop them
	// TODO check if this works for formations (probably should, but make sure it really does)
	var cmpTrader = Engine.QueryInterface(this.entity, IID_Trader);
	if (!cmpTrader)
		return;
	cmpTrader.SetTargetMarkets(targets, source);

	if (!cmpTrader.HasBothMarkets()) // TODO rename to HasEnoughMarkets
	{
		warn("invalid request, must specify enough markets");
		return
	}

	let data = {
		"target": cmpTrader.GetFirstMarket(),
		"route": null,//route,
		"force": false
	};

	if (this.IsFormationController())
	{
		this.CallMemberFunction("AddOrder", ["Trade", data, queued]);
		var cmpFormation = Engine.QueryInterface(this.entity, IID_Formation);
		if (cmpFormation)
			cmpFormation.Disband();
	}
	else
		this.AddOrder("Trade", data, queued);
};

UnitAI.prototype.PerformTradeAndMoveToNextMarket = function(currentMarket)
{
	if (!this.CanTrade(currentMarket))
	{
		this.StopTrading();
		return;
	}

	if (!this.CheckTargetRange(currentMarket, IID_Trader))
	{
		if (!this.MoveToMarket(currentMarket))	// If the current market is not reached try again
			this.StopTrading();
		return;
	}

	let cmpTrader = Engine.QueryInterface(this.entity, IID_Trader);
	let nextMarket = cmpTrader.PerformTrade(currentMarket);
	let amount = cmpTrader.GetGoods().amount;
	if (!nextMarket || !amount || !amount.traderGain)
	{
		this.StopTrading();
		return;
	}

	this.order.data.target = nextMarket;

	// TODO fix this by packing waypoints with the market? breaks for more than 2 markets
	if (this.order.data.route && this.order.data.route.length)
	{
		this.waypoints = this.order.data.route.slice();
		if (this.order.data.target == cmpTrader.GetSecondMarket())
			this.waypoints.reverse();
		this.waypoints.unshift(null);  // additionnal dummy point for the market
	}

	if (this.MoveToMarket(nextMarket))	// We've started walking to the next market
		this.SetNextState("APPROACHINGMARKET");
	else
		this.StopTrading();
};
