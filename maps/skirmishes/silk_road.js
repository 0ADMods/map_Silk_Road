const markets = [1022, 1023, 1034, 1035];
const docks = [1060, 1064];
const houses = [1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1048, 1049, 1052, 1068, 1070, 1071, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1665, 1666];
const storehouses = [1062, 1063];
const farmsteads = [1050, 1069];

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

var cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

cmpTrigger.DoAfterDelay(0, "SetupInvulnerable", {});

