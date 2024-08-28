var generator = angular.module('PMGenerator', []);
var hostUrl = 'http://172.17.0.3:5002/pm/api';

window.onload = function () {
	startTab();
};

function startTab() {
	document.getElementById("defaultOpen").click();

}

function createCommandFile(commandText, fileName) {
	var blob = new Blob([commandText], {type: 'application/x-sh'});
	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(blob, filename);
	} else{
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

generator.controller('CountersController', function($scope, $http) {
	$scope.counterList = [];
	$scope.groupId = "TestMediatorGroup";
	$scope.reportId = "test_mediator_report";
	$scope.periods = ['OneMin', 'FiveMin', 'FifteenMin', 'ThirtyMin', 'OneHour', 'TwelveHour','OneDay'];
	$scope.counterTypes = ['CC', 'Gauge', 'DER', 'SI'];
	$scope.selectedPeriod = 'FifteenMin';
	$scope.selectedType = 'CC';
	$scope.filename = "torun.sh";

	$scope.addCounter = function() {
		if ($scope.counterName != 'undefined' && $scope.counterName != null && $scope.counterName.length > 0) {
			$scope.counterList.push({text:$scope.counterName, type:$scope.selectedType});
			$scope.counterName='';
		}
	};

	$scope.clearCounter = function(counter) {
		var index = $scope.counterList.indexOf(counter);
		$scope.counterList.splice(index, 1);
	};

	$scope.activateReport = function() {
		// Command to create metric group
		var postUrl = 'curl -X POST ' + hostUrl;
		var objectToFile = postUrl + '/v3.0/groups -H "Content-Type:application/json" -d \'{"id": "' + $scope.groupId + '"}\'\n';
		var commandForMetrics = postUrl + '/v3.0/groups/' + $scope.groupId + '/metrics -H "Content-Type: application/json" -d \'{"id":"';

		//Command to create metric counters
		angular.forEach($scope.counterList, function (value, key) {
			var createMetrics = commandForMetrics + value.text + '", "type":"' + value.type;
			if (value.type == 'CC') {
				createMetrics += '","aggregation": "Sum"';
			}
			else {
				createMetrics += '","aggregation": "Avg"';
			}
			if (value.type == 'DER') {
				objectToFile += createMetrics + ', "multiplicity":3}\'\n';
			}
			else {
				objectToFile += createMetrics + '}\'\n';
			}

		});

		//Command to create metric report
		objectToFile += postUrl + '/v1.0/reports -H "Content-Type: application/json" -d \'{"id": "' +
		$scope.reportId +'", "state": "Active", "period":"' + $scope.selectedPeriod + '", "groups": ["' + $scope.groupId + '"], "metrics": ["';

		angular.forEach($scope.counterList, function (value, key) {
			objectToFile += value.text + '"';
			if ($scope.counterList.indexOf(value) < $scope.counterList.length -1) objectToFile += ', "';
		});
		objectToFile += '], "sources": ["SOURCE1", "SOURCE2"]}\'\n';

		//Command to create metric data
		var putUrl = 'curl -X PUT  '+ hostUrl;
		objectToFile += putUrl + '/v1.0/data -H "Content-Type: application/json" -d \'[';

		console.log($scope.selectedType);


		angular.forEach($scope.counterList, function (value, key) {
			if (value.type == 'DER') {
				// array of integers value multiplicity 3
				objectToFile += '{"source":"SOURCE1","values": [' + Math.floor(Math.random() * 100) +',' + Math.floor(Math.random() * 100) +','+ Math.floor(Math.random() * 100) +'],"groupId": "' + $scope.groupId + '","metricId": "' + value.text + '"}, ';//]\'';
				objectToFile += '{"source":"SOURCE2","values": [' + Math.floor(Math.random() * 100) +',' + Math.floor(Math.random() * 100) +','+ Math.floor(Math.random() * 100) +'],"groupId": "' + $scope.groupId + '","metricId": "' + value.text + '"}';//]\'';
				if ($scope.counterList.indexOf(value) < $scope.counterList.length -1) objectToFile += ', ';
			}
			else {
				objectToFile += '{"source":"SOURCE1","values": [' + Math.floor(Math.random() * 100) +'],"groupId": "' + $scope.groupId + '","metricId": "' + value.text + '"}, ';//]\'';
				objectToFile += '{"source":"SOURCE2","values": [' + Math.floor(Math.random() * 100) +'],"groupId": "' + $scope.groupId + '","metricId": "' + value.text + '"}';//]\'';
				if ($scope.counterList.indexOf(value) < $scope.counterList.length -1) objectToFile += ', ';
			}
		});

		objectToFile += ']\'';

		createCommandFile(objectToFile, $scope.filename);
	};


	$scope.reactivateReport = function() {
		var objectToFile = 'curl -X PATCH ' + hostUrl + '/v1.0/reports/' + $scope.reportId + ' -H "Content-Type: application/json" -d \'{"state": "Active"}\'';
		createCommandFile(objectToFile, $scope.filename);
	};

	$scope.stopReport = function() {
		var objectToFile = 'curl -X PATCH ' + hostUrl + '/v1.0/reports/' + $scope.reportId + ' -H "Content-Type: application/json" -d \'{"state": "Stopped"}\'';
		createCommandFile(objectToFile, $scope.filename);
	};

	$scope.removeMetrics = function() {
		//Delete report
		var objectToFile = 'curl -X DELETE ' + hostUrl + '/v1.0/reports/' + $scope.reportId + '\n';
		//Delete counters
		angular.forEach($scope.counterList, function (value, key) {
			objectToFile += 'curl -X DELETE ' + hostUrl + '/v3.0/groups/'+ $scope.groupId + '/metrics/' + value.text + '\n';
		});
		//Delete group
		objectToFile += 'curl -X DELETE ' + hostUrl + '/v3.0/groups/' + $scope.groupId;

		createCommandFile(objectToFile, $scope.filename);
	};

	$scope.list = function() {
		$http.get(hostUrl + '/v1.0/reports')
		.then(
				//OK
				function(reports){
					$scope.reportList = [];
					for (i in reports.data) {
						$scope.reportList.push({id:reports.data[i].id, state:reports.data[i].state, period:reports.data[i].period, groups:reports.data[i].groups, metrics:reports.data[i].metrics});
					}

				},
				//NOT OK
				function(data){
				}
		);
	};

});

