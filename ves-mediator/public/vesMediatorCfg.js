var generator = angular.module('VES-Mediator', []);

window.onload = function () {
	startTab();
};

function startTab() {
	document.getElementById("defaultOpen").click();

}

function createCommandFile(commandText, fileName) {
	var blob = new Blob([commandText], { type: 'application/x-sh' });
	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(blob, filename);
	} else {
		var e = document.createEvent('MouseEvents'),
			a = document.createElement('a');
		a.download = fileName;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
		e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	}
}

function openTab(evt, cityName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(cityName).style.display = "block";
	evt.currentTarget.className += " active";
}

generator.controller('MediatorCtrl', function ($scope, $http) {

	//get configuration from persistence storage HTTP GET
	$http.get('/cfg')
		.then(
		//OK
		function (cfg) {
			$scope.vnfIp = cfg.data.vnfIp;
			$scope.snmpPort = cfg.data.snmpAgentPort;
			$scope.snmpTrapListenerPort = cfg.data.snmpTrapListenerPort;
			$scope.pmPort = cfg.data.pmPort;
			$scope.sourceName = cfg.data.sourceName;
			$scope.sourceId = cfg.data.sourceId;
			$scope.vesIp = cfg.data.vesIp;
			$scope.vesPort = cfg.data.vesPort;
			$scope.sftpUsername = cfg.data.sftpUsername;
			$scope.sftpPasswd = "******";
			$scope.vesUsername = cfg.data.vesUsername;
			$scope.vesPasswd = "******";
			$scope.pmRopPath = cfg.data.pmRopPath;
			$scope.selectedPeriod = cfg.data.pmRopInterval;
			$scope.counterList = [];
			for (i in cfg.data.pmCounterFilter) {
				$scope.counterList.push({ name: cfg.data.pmCounterFilter[i] });
			}
		},
		//NOT OK
		function (cfg) {
			$scope.vnfIp = "";
			$scope.snmpPort = "";
			$scope.snmpTrapListenerPort = "";
			$scope.pmPort = "";
			$scope.sourceName = "";
			$scope.sourceId = "";
			$scope.vesIp = "";
			$scope.vesPort = "";
			$scope.vesUsername = "";
			$scope.vesPasswd = "";
			$scope.sftpUsername = "";
			$scope.sftpPasswd = "";
			$scope.selectedPeriod = 'FifteenMin';
			$scope.pmRopPath = "";
			$scope.counterList = [];
		}
		);

	$scope.periods = ['OneMin', 'FiveMin', 'FifteenMin', 'ThirtyMin', 'OneHour', 'TwelveHour', 'OneDay'];

	//add a new PM counter
	$scope.addCounter = function () {
		if ($scope.counterName != 'undefined' && $scope.counterName != null && $scope.counterName.length > 0) {
			$scope.counterList.push({ name: $scope.counterName });
			$scope.counterName = '';
		}
	};

	// remove PM counter
	$scope.clearCounter = function (counter) {
		var index = $scope.counterList.indexOf(counter);
		$scope.counterList.splice(index, 1);
	};


	//post configuration to persistence storage
	$scope.configure = function () {
		$scope.url = '/cfg';
		$scope.data = {
			"vnfIp": $scope.vnfIp,
			"snmpPort": $scope.snmpPort,
			"snmpTrapListenerPort": $scope.snmpTrapListenerPort,
			"pmPort": $scope.pmPort,
			"sourceName": $scope.sourceName,
			"sourceId": $scope.sourceId,
			"vesIp": $scope.vesIp,
			"vesPort": $scope.vesPort,
			"vesUsername": $scope.vesUsername,
			"vesPasswd": $scope.vesPasswd,
			"pmCounterFilter": $scope.counterList,
			"pmRopInterval": $scope.selectedPeriod,
			"pmRopPath": $scope.pmRopPath,
			"sftpUsername": $scope.sftpUsername,
			"sftpPasswd": $scope.sftpPasswd
		};
		$http.post($scope.url, $scope.data).
			then(function (response) {
				$scope.data.result = response.data.message;
			}, function (response) {
				$scope.data.result = response.data.message;
			});

	}

	// re-start the mediator
	$scope.reStart = function () {
		$scope.url = '/restart';

		$http.post($scope.url).
			then(function (response) {
				$scope.data.result = response.data.message;
			}, function (response) {
				$scope.data.result = response.data.message;
			});
	}

});
