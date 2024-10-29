var app = angular.module('excelApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'login.html',
        controller: 'LoginController'
    })
    .when('/products', {
        templateUrl: 'products.html',
        controller: 'ProductsController'
    })
    .when('/table', {
        templateUrl: 'table.html',
        controller: 'TableController'
    })
    .otherwise({
        redirectTo: '/'
    });
});

app.controller('LoginController', function($scope, $location) {
    $scope.username = '';
    $scope.password = '';
    $scope.loginError = false;
    $scope.login = function() {
        if ($scope.username === 'admin' && $scope.password === 'password') {
            $location.path('/products');
        } else {
            $scope.loginError = true;
            $scope.loginErrorMessage = "خطأ في اسم المستخدم او كلمة المرور";
        }
    };
});

app.controller('ProductsController', function($scope, $location) {
    $scope.products = [
        { name: 'Artev', image: 'images/artev.jpeg' },
        { name: 'CP', image: 'images/cp.jpeg' },
        { name: 'ID Baby', image: 'images/baby.jpeg' },
        { name: 'ID Touch', image: 'images/touch.jpeg' }
    ];

    $scope.viewProduct = function(product) {
        alert('Viewing ' + product.name);
    };

    $scope.viewAllProducts = function() {
        $location.path('/table');
    };
});

app.controller('TableController', function($scope) {
    $scope.headers = ["عدد كل كرتونة", "رصيد حالي", "هالك", "مرتجع", "منصرف", "وارد", "اسم", "كود", "الحد الادني"];
    $scope.columnVisibility = $scope.headers.reduce((acc, header) => {
        acc[header] = true;
        return acc;
    }, {});

    $scope.tableData = [
        { "عدد كل كرتونة": "Data 1-1", "رصيد حالي": "19", "هالك": "Data 1-3", "مرتجع": "Data 1-4", "منصرف": "Data 1-5", "وارد": "Data 1-6", "اسم": "Data 1-7", "كود": "Data 1-8", "الحد الادني": 10 },
        { "عدد كل كرتونة": "Data 2-1", "رصيد حالي": "9", "هالك": "Data 2-3", "مرتجع": "Data 2-4", "منصرف": "Data 2-5", "وارد": "Data 2-6", "اسم": "Data 2-7", "كود": "Data 2-8", "الحد الادني": 6 }
        // Add more data rows as needed...
    ];

    $scope.showModal = false;
    $scope.showAlertModal = false;
    $scope.showHistoryModal = false;
    $scope.editContext = {};
    $scope.editHistories = {};
    $scope.alertContext = {};

    // Check if stock is below threshold
    $scope.isBelowThreshold = function(row) {
        return parseInt(row["رصيد حالي"]) < parseInt(row["الحد الادني"]);
    };

    // Custom filter for search functionality
    $scope.customFilter = function(row) {
        if (!$scope.searchText) return true;
        return Object.values(row).some(value => value.toString().toLowerCase().includes($scope.searchText.toLowerCase()));
    };

    // Column visibility checker
    $scope.isColumnVisible = function(header) {
        return $scope.columnVisibility[header];
    };

    // Display alert when stock is below threshold
    $scope.showAlert = function(row) {
        $scope.alertContext = { stock: row["رصيد حالي"] };
        $scope.showAlertModal = true;
    };

    $scope.closeAlert = function() {
        $scope.showAlertModal = false;
        $scope.alertContext = {};
    };

    // Function to update "رصيد حالي" for a specific row
    $scope.updateCurrentBalance = function(row) {
        const وارد = parseInt(row["وارد"]) || 0;
        const منصرف = parseInt(row["منصرف"]) || 0;
        const مرتجع = parseInt(row["مرتجع"]) || 0;
        const هالك = parseInt(row["هالك"]) || 0;
        row["رصيد حالي"] = وارد - (منصرف + مرتجع + هالك);
    };

    // Show confirmation modal for edit
    $scope.showConfirmationModal = function(row, key, event) {
        const newValue = event.target.innerText.trim();
        if (newValue !== row[key]) {
            $scope.editContext = {
                row: row,
                key: key,
                previousValue: row[key],
                newValue: newValue
            };
            $scope.showModal = true;
        }
    };

    $scope.confirmYes = function() {
        if ($scope.editContext.row && $scope.editContext.key) {
            const rowKey = $scope.tableData.indexOf($scope.editContext.row);
            const edit = {
                date: new Date().toLocaleString(),
                before: $scope.editContext.previousValue,
                after: $scope.editContext.newValue,
                column: $scope.editContext.key
            };

            // Ensure a history array exists for this row
            if (!$scope.editHistories[rowKey]) {
                $scope.editHistories[rowKey] = [];
            }

            // Add the edit to the history list for this row
            $scope.editHistories[rowKey].push(edit);

            // Apply the new value to the row data
            $scope.editContext.row[$scope.editContext.key] = $scope.editContext.newValue;

            // Update the current balance for this specific row
            $scope.updateCurrentBalance($scope.editContext.row);
        }

        $scope.showModal = false;
        $scope.editContext = {};
    };

    $scope.confirmNo = function() {
        $scope.showModal = false;
        $scope.editContext = {};
    };

    $scope.saveData = function() {
        alert("Data saved successfully!");
    };

    $scope.viewEditHistory = function(row) {
        const rowKey = $scope.tableData.indexOf(row);
        $scope.selectedRowEditHistory = $scope.editHistories[rowKey] || [];
        $scope.showHistoryModal = true;
    };

    $scope.closeHistory = function() {
        $scope.showHistoryModal = false;
        $scope.selectedRowEditHistory = [];
    };

    $scope.closeHistoryOnClick = function(event) {
        if (event.target.className.includes('custom-modal')) {
            $scope.closeHistory();
            $scope.$apply();
        }
    };
});
