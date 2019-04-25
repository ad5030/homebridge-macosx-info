var Accessory, Service, Characteristic, UUIDGen, FakeGatoHistoryService;
var inherits = require('util').inherits;
const fs = require('fs');
const packageFile = require("./package.json");
var os = require("os");
var hostname = os.hostname();

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

function readUptime() {
	const exec = require('child_process').exec;
	var script = exec('~/r2d2/it/homekit/homebridge-macosx-info/sh/homebridge-macosx-info.sh',
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
        this.readFile = "/tmp/homebridge-macosx-info.json";
    }
    if(config["updateInterval"] && config["updateInterval"] > 0) {
        this.updateInterval = config["updateInterval"];
    } else {
        this.updateInterval = null;
    }
  
	this.setUpServices();
};

//MacOSXSysInfo.prototype.getUptime = function (callback) {
//	
//	var data = fs.readFileSync("/tmp/_hb_uptime.txt", "utf-8");
//	var uptime = data.substring(10, data.indexOf(",", data.indexOf(",", 0)+1));
		
//	callback(null, uptime);
//};

MacOSXSysInfo.prototype.getUptime = function (callback) {
	var json = fs.readFileSync("/tmp/_homebridge-macosx-info.json", "utf-8");
	var obj = JSON.parse(json);
	var uptime = (obj.uptime);
	callback(null, uptime);
};

MacOSXSysInfo.prototype.getFan = function (callback) {
	var json = fs.readFileSync("/tmp/_homebridge-macosx-info.json", "utf-8");
	var obj = JSON.parse(json);
	var fan = parseFloat(obj.fan);
	callback(null, fan);
};

MacOSXSysInfo.prototype.getDisk = function (callback) {
	var json = fs.readFileSync("/tmp/_homebridge-macosx-info.json", "utf-8");
	var obj = JSON.parse(json);
	var disk = parseFloat(obj.disk);
	callback(null, disk);
};

MacOSXSysInfo.prototype.getAvgLoad = function (callback) {
//	var data = fs.readFileSync("/tmp/_hb_uptime.txt", "utf-8");
//	var load = data.substring(data.length - 15);
	var json = fs.readFileSync("/tmp/_homebridge-macosx-info.json", "utf-8");
	var obj = JSON.parse(json);
	var load = obj.load;
	
	callback(null, load);
};

//MacOSXSysInfo.prototype.getAvgLoad = function (callback) {
	
//	var json = fs.readFileSync("/tmp/sys_mon.json", "utf-8");
	//var json = '{"temperature":28.7, "fan":1796, "uptime":12.5, "load":6.9, "mem":1163}';
//	var obj = JSON.parse(json);
//	var load = parseFloat(obj.load).toFixed(1);
//	callback(null, load);

//};

MacOSXSysInfo.prototype.getMem = function (callback) {
	var json = fs.readFileSync("/tmp/_homebridge-macosx-info.json", "utf-8");
	var obj = JSON.parse(json);
	var mem = parseFloat(obj.mem);
	callback(null, mem);

};

MacOSXSysInfo.prototype.setUpServices = function () {

	var that = this;
	var temp;
	
	this.infoService = new Service.AccessoryInformation();
	this.infoService
		.setCharacteristic(Characteristic.Manufacturer, "di-marco_a.net")
		.setCharacteristic(Characteristic.Model, this.name)
		.setCharacteristic(Characteristic.SerialNumber, "042-SN-20190407-" + packageFile.version)
		.setCharacteristic(Characteristic.FirmwareRevision, packageFile.version);
	
	this.fakeGatoHistoryService = new FakeGatoHistoryService("weather", this, { storage: 'fs' });
	
	let uuid1 = UUIDGen.generate(that.name + '-Uptime');
	info = function (displayName, subtype) {
		Characteristic.call(this, 'Uptime :', uuid1);
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
		Characteristic.call(this, 'Avg Load (%) :', uuid2);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(load, Characteristic);
	load.UUID = uuid2;
	
	let uuid3 = UUIDGen.generate(that.name + '-Mem');
	mem = function () {
		Characteristic.call(this, 'Free Mem (Mo) :', uuid3);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(mem, Characteristic);
	mem.UUID = uuid3;

	let uuid4 = UUIDGen.generate(that.name + '-Fan');
	fan = function () {
		Characteristic.call(this, 'Fan (rpm) :', uuid4);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(fan, Characteristic);
	fan.UUID = uuid4;

	let uuid5 = UUIDGen.generate(that.name + '-Disk');
	disk = function () {
		Characteristic.call(this, 'Disk used (%) :', uuid5);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(disk, Characteristic);
	disk.UUID = uuid5;

	this.macOSXService = new Service.TemperatureSensor(that.name);
	var currentTemperatureCharacteristic = this.macOSXService.getCharacteristic(Characteristic.CurrentTemperature);
	this.macOSXService.getCharacteristic(info)
		.on('get', this.getUptime.bind(this));
	this.macOSXService.getCharacteristic(load)
		.on('get', this.getAvgLoad.bind(this));
	this.macOSXService.getCharacteristic(mem)
		.on('get', this.getMem.bind(this));
	this.macOSXService.getCharacteristic(fan)
		.on('get', this.getFan.bind(this));
		this.macOSXService.getCharacteristic(disk)
		.on('get', this.getDisk.bind(this));
		function getCurrentTemperature() {
		var data = fs.readFileSync(that.readFile, "utf-8");

	var obj = JSON.parse(data);
	var temperatureVal = (obj.temperature);

		//var temperatureVal = parseFloat(data) / 1000;
	//	var temperatureVal = parseFloat(data.replace(',', '.'));
		//var temperatureVal = parseFloat(data);
		temp = temperatureVal;
		that.log.debug("update currentTemperatureCharacteristic value: " + temperatureVal);
		return temperatureVal;
	}
	
	readUptime();
	
	currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
	if(that.updateInterval) {
		setInterval(() => {
			currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
			
			that.log("Temperature: " + temp);
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