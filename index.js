//-------------------------------------------------------------------
//~ @(#) Name : index.js
//~ @(#) Desc : 
//~ @(#) version : 1.0
// Auteur : adm@di-marco.net
// Date : 2019-05-05
//-------------------------------------------------------------------
// Version history
//   v1.O - Initial version
//   test and work on : mac mini (late 2014) & macOSX 10.13.6(High Sierra) 
//-------------------------------------------------------------------
var Accessory, Service, Characteristic, UUIDGen, FakeGatoHistoryService;
var inherits = require('util').inherits;
const fs = require('fs');
const packageFile = require("./package.json");
var os = require("os");
var hostname = os.hostname();

const UNIT_RPM='rpm'
const UNIT_MO='Mo'
const UNIT_PERCENT='%'
const UNIT_WATT='Watt'

module.exports = function(homebridge) {
    if(!isConfig(homebridge.user.configPath(), "accessories", "MacOSXSysInfo")) {
        return;
    }
    
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    FakeGatoHistoryService = require("fakegato-history")(homebridge);

    homebridge.registerAccessory('homebridge-macosx-info', 'MacOSXSysInfo', MacOSXSysInfo);
}

async function readUptime() {
    const exec = require('child_process').exec;
var script = await exec('/usr/local/lib/node_modules/homebridge-macosx-info/src/sh/homebridge-macosx-info.sh', 
(error, stdout, stderr) => {
            if (error !== null) {
                //this.log("exec error: " + ${error});
            }
        }); 
};

function isConfig(configFile, type, name) {
    var config = JSON.parse(fs.readFileSync(configFile));
    if("accessories" === type) {
        var accessories = config.accessories;
        for(var i in accessories) {
            if(accessories[i]['accessory'] === name) {
                return true;
            }
        }
    } else if("platforms" === type) {
        var platforms = config.platforms;
        for(var i in platforms) {
            if(platforms[i]['platform'] === name) {
                return true;
            }
        }
    } else {
    }
    return false;
};

function MacOSXSysInfo(log, config) {
    if(null == config) {
        return;
    }

    this.log = log;
	this.name = config["name"];
    if(config["file"]) {
		this.readFile = config["file"];
    } else {
		this.readFile = "/tmp/_homebridge-macosx-info.json";
	}

	if(config["consumption"]) {
		this.consumption = config["consumption"];
    } else {
		this.consumption = null;
	}
	if(config["user"]) {
		this.user = config["user"];
    } else {
		this.user = null;
	}
	  if(config["updateInterval"] && config["updateInterval"] > 0) {
        this.updateInterval = config["updateInterval"];
    } else {
        this.updateInterval = null;
    }
  
	this.setUpServices();
};

MacOSXSysInfo.prototype.getUptime = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var uptime = (obj.uptime);
	callback(null, uptime);
};

MacOSXSysInfo.prototype.getFan = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var fan = obj.fan;
	callback(null, fan);
};

MacOSXSysInfo.prototype.getDisk = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var disk = obj.disk;
	callback(null, disk);
};

MacOSXSysInfo.prototype.getAvgLoad = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var load = obj.load;
	
	callback(null, load);
};

MacOSXSysInfo.prototype.getFreeMem = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var freemem = obj.freemem;
	callback(null, freemem);
};

MacOSXSysInfo.prototype.getUser = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var user = obj.user;
	callback(null, user);
};

MacOSXSysInfo.prototype.getPower = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var power = obj.power;
	callback(null, power);
};

MacOSXSysInfo.prototype.setUpServices = function () {

	var that = this;
	var temp;
	
	this.infoService = new Service.AccessoryInformation();
	this.infoService
		.setCharacteristic(Characteristic.Manufacturer, "@ad5030")
		.setCharacteristic(Characteristic.Model, this.name)
		.setCharacteristic(Characteristic.SerialNumber, "042-SN-20190505" + "_" + packageFile.version)
		.setCharacteristic(Characteristic.FirmwareRevision, packageFile.version);
	
	this.fakeGatoHistoryService = new FakeGatoHistoryService("weather", this, { storage: 'fs' });
	
	let uuid1 = UUIDGen.generate(that.name + '-Uptime');
	info = function (displayName, subtype) {
		Characteristic.call(this, 'Uptime', uuid1);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(info, Characteristic);
	info.UUID = uuid1;

	let uuid2 = UUIDGen.generate(that.name + '-AvgLoad');
	load = function () {
		Characteristic.call(this, 'Avg Load', uuid2);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_PERCENT,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(load, Characteristic);
	load.UUID = uuid2;
	
	let uuid3 = UUIDGen.generate(that.name + '-Mem');
	freemem = function () {
		Characteristic.call(this, 'Free Mem', uuid3);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_MO,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(freemem, Characteristic);
	freemem.UUID = uuid3;

	let uuid4 = UUIDGen.generate(that.name + '-Fan');
	fan = function () {
		Characteristic.call(this, 'Fan speed', uuid4);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_RPM,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(fan, Characteristic);
	fan.UUID = uuid4;

	let uuid5 = UUIDGen.generate(that.name + '-Disk');
	disk = function () {
		Characteristic.call(this, 'Disk used', uuid5);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_PERCENT,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(disk, Characteristic);
	disk.UUID = uuid5;

	let uuid6 = UUIDGen.generate(that.name + '-User');
	user = function () {
		Characteristic.call(this, 'Users (nb)', uuid6);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(user, Characteristic);
	user.UUID = uuid6;


	let uuid7 = UUIDGen.generate(that.name + '-Consumption');
	power = function () {
		Characteristic.call(this, 'Consumption', uuid7);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_WATT,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(power, Characteristic);
	power.UUID = uuid7;

	this.macOSXService = new Service.TemperatureSensor(that.name);
	var currentTemperatureCharacteristic = this.macOSXService.getCharacteristic(Characteristic.CurrentTemperature);		
	this.macOSXService.getCharacteristic(info)
		.on('get', this.getUptime.bind(this));
	this.macOSXService.getCharacteristic(load)
		.on('get', this.getAvgLoad.bind(this));
	this.macOSXService.getCharacteristic(freemem)
		.on('get', this.getFreeMem.bind(this));
	this.macOSXService.getCharacteristic(fan)
		.on('get', this.getFan.bind(this));
	this.macOSXService.getCharacteristic(disk)
		.on('get', this.getDisk.bind(this));
	if(this.user) {
	this.macOSXService.getCharacteristic(user)
		.on('get', this.getUser.bind(this));
	}
	if(this.consumption) {
	this.macOSXService.getCharacteristic(power)
		.on('get', this.getPower.bind(this));
	}
	function getCurrentTemperature() {
		var data = fs.readFileSync(that.readFile, "utf-8");

		var obj = JSON.parse(data);
		var temperatureVal = (obj.temperature);

		temp = temperatureVal;
		that.log.debug("update currentTemperatureCharacteristic value: " + temperatureVal);
		return temperatureVal;
	}
	
	readUptime();
	
	currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
	if(that.updateInterval) {
		setInterval(() => {
			currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
			
			that.log("Current Temp: " + temp);
			this.fakeGatoHistoryService.addEntry({time: new Date().getTime() / 1000, temp: temp});
			//this.fakeGatoHistoryService.addEntry({time: new Date().getTime(), temp: temp});	

			readUptime();
			
		}, that.updateInterval);
	}
	
	currentTemperatureCharacteristic.on('get', (callback) => {
		callback(null, getCurrentTemperature());
	});
}

MacOSXSysInfo.prototype.getServices = function () {

	return [this.infoService, this.fakeGatoHistoryService, this.macOSXService];
};