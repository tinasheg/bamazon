const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'Bamazon'
});

function validateInput(value) {
	let integer = Number.isInteger(parseFloat(value));
	let sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}

function promptUserPurchase() {
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please enter the Item ID for the product you would like to purchase.',
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many items do you need?',
			validate: validateInput,
			filter: Number
		}
	]).then(function (input) {

		let item = input.item_id;
		let quantity = input.quantity;
		let queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, { item_id: item }, function (err, data) {
			if (err) throw err;
			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				displayInventory();
			} else {
				let productData = data[0];

				if (quantity <= productData.stock_quantity) {
					console.log('Congratulations, the product you requested is in stock! Placing order!');

					let updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					connection.query(updateQueryStr, function (err, data) {
						if (err) throw err;

						console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
						console.log('Thank you for shopping with us!');
						console.log("\n---------------------------------------------------------------------\n");

						connection.end();
					})
				} else {
					displayInventory();

					console.log('Sorry, insufficent product in stock, your order can not be completed.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

				}
			}
		})
	})
}

function displayInventory() {

	queryStr = 'SELECT * FROM products';

	connection.query(queryStr, function (err, data) {
		if (err) throw err;

		console.log('Existing Inventory: ');
		console.log('...................\n');

		let strOut = '';
		for (let i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'Item ID: ' + data[i].item_id + '  //  ';
			strOut += 'Product Name: ' + data[i].product_name + '  //  ';
			strOut += 'Department: ' + data[i].department_name + '  //  ';
			strOut += 'Price: $' + data[i].price + '\n';

			console.log(strOut);
		}

		console.log("---------------------------------------------------------------------\n");

		promptUserPurchase();
	})
}


function runBamazon() {

	displayInventory();
}

runBamazon();