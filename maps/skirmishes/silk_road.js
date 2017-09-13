// TODO: Think about not hard-coding all of this (complicated for the actual tradeposts)
const markets = [1022, 1023, 1034, 1035];
const docks = [1060, 1064];
const houses = [1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1048, 1049, 1052, 1068, 1070, 1071, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1665, 1666];
const storehouses = [1062, 1063];
const farmsteads = [1050, 1069];

const tradeposts = [1064, 1035, 1022, 1023, 1034, 1060];

Trigger.prototype.SetupInvulnerable = function(data)
{
	let ents = markets.concat(docks, houses, storehouses, farmsteads);
	for (let ent of ents)
	{
		let cmpArmour = Engine.QueryInterface(ent, IID_DamageReceiver);
		if (cmpArmour)
			cmpArmour.SetInvulnerability(true);
	}
};

// TODO make sure the market owner gets the full resource amount (not gaia does; doesn't need it)
Trigger.prototype.CreateTradeRoute = function(data)
{
	for (let i=0; i < tradeposts.length; ++i)
	{
		// TODO different traders?
		let traders = TriggerHelper.SpawnUnits(tradeposts[i], "units/pers_support_trader", 1, 0 /*gaia*/);

		// Create a circular route
		// so for A B C D E F with tradeposts[i]==A we get BCDEFEDCB
		let posts = [];
		for (let j = i+1; j < tradeposts.length; ++j)
			posts.push(tradeposts[j]);
		for (let j = tradeposts.length-2; j > 0; --j)
			posts.push(tradeposts[j]);
		for (let j = 0; j < i; ++j)
			posts.push(tradeposts[j]);
//		warn("post "+tradeposts[i]+" has other posts: "+uneval(posts));

		for (let t of traders)
		{
			let cmpUnitAI = Engine.QueryInterface(t, IID_UnitAI);
			if (!cmpUnitAI) {
				Engine.DestroyEntity(t);
				continue;
			}

			// Make traders invulnerable, as otherwise players can just kill them all,
			// or if we'd respawn them kill them and loot more resources.
			let cmpArmour = Engine.QueryInterface(t, IID_DamageReceiver);
			if (cmpArmour)
				cmpArmour.SetInvulnerability(true);

			// TODO add waypoints between the individual posts (needs route support for the below function)
			cmpUnitAI.SetupTradeRoute_(posts, tradeposts[i], false);
		}
	}
};

var cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

// Set every player to be neutral from the perspective of the trader player
// TODO a special player would be better as then we could set it to be an ally (without vision? TODO decide)
//      of the player so they don't attack the traders (they can't damage them, but still)

// NOTE adding a player dynamically doesn't work as some other code relies on numPlayers and other things quite early on, but that would be a nice way, as it doesn't have the special player show up in gamesetup

var cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
let numPlayers = cmpPlayerManager.GetNumPlayers();
let cmpTraderPlayer = QueryPlayerIDInterface(0); // adding a player dynamically doesn't work, as at least a few places need the player count on init, and once we're here that is too late
//cmpTraderPlayer.SetName("Trader"); // TODO i18n
for (let i = 1; i < numPlayers-1; ++i)
{
	cmpTraderPlayer.SetNeutral(i);
}

cmpTrigger.DoAfterDelay(0, "SetupInvulnerable", {});
cmpTrigger.DoAfterDelay(0, "CreateTradeRoute", {});
