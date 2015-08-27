const markets = [1022, 1023, 1034, 1035];
const docks = [1060, 1064];

Trigger.prototype.SetupInvulnerable = function(data)
{
	let ents = markets.concat(docks);
	for (let ent of ents)
	{
		let cmpArmour = Engine.QueryInterface(ent, IID_DamageReceiver);
		if (cmpArmour)
			cmpArmour.SetInvulnerability(true);
	}
};

var cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

cmpTrigger.DoAfterDelay(0, "SetupInvulnerable", {});

