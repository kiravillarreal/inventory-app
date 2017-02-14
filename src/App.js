import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Table } from 'react-bootstrap';

var uuid = require('uuid');
var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyDPDuilhNDgkexLzfQ1J_Lvf_6IPfBkH9I",
  authDomain: "inventory-3a27a.firebaseapp.com",
  databaseURL: "https://inventory-3a27a.firebaseio.com",
  storageBucket: "inventory-3a27a.appspot.com",
  messagingSenderId: "264372117681"
};
firebase.initializeApp(config);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: [],
      id: uuid.v1(),
      submitted: false
    }
  }

  //Loading the data from firebase
  _loadFirebaseData() {
    var self = this;

    this.setState({ inventory: [] });

    //Getting data from firebase
    firebase.database().ref().once('value').then((snapshot) => {
      snapshot.forEach(function (data) {
        self.setState({
          inventory: self.state.inventory.concat(data.val())
        });
      });
    });

  }

  componentDidMount() {
    this._loadFirebaseData();
  }

  render() {
    var inputForm;
    var table;
    var rows;

    //console.log("inventoryArray: " + JSON.stringify(this.state.inventory));

    inputForm = <span>
      <h2>Please enter your inventory Item</h2>
      <form onSubmit={this.onSubmit.bind(this)}>
        <input type="text" placeholder="Enter Name..." name="name" />
        <input type="text" placeholder="Enter description..." name="description" />
        <input type="text" placeholder="Enter quantity..." name="quantity" />
        <button type="submit">Submit</button>
      </form>
    </span>

    var self = this;
    //console.log(this.state.inventory);
    rows = this.state.inventory.map(function (item, index) {

      return Object.keys(item).map(function (s) {
        return (
          (
            <tr key={s}>
              <th> {item[s].inventory.name} </th>
              <th> {item[s].inventory.description}  </th>
              <th> {item[s].inventory.quantity}  </th>
              <th><button onClick={self.handleClick(self, item[s].inventory)}>Delete</button></th>
            </tr>
          )
        )
      });

    });

    table = (
      <span>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th> Name </th>
              <th> Description </th>
              <th> Quantity </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </span>
    )





    return (
      <div className="App">
        <div className="App-header">
          <h2>Inventory App</h2>
        </div>
        <div className="text-center">
          {inputForm}
        </div>
        <div>
          {table}
        </div>
      </div>
    );
  }


  onSubmit(event) {
    event.preventDefault();

    const details = {}

    //Go through each element in the form making sure it's an input element
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      } else {
        el.value = null
      }
    })

    const newInventoryItem = this.state.inventory.slice()

    if (details.name) {
      newInventoryItem.push(details)
    }

    this.setState({
      inventory: newInventoryItem,
      submitted: true,
      id: uuid.v1()
    })

    //var id = uuid.v1();
    firebase.database().ref('Inventory/' + this.state.id).set({
      inventory: details
    });

    this._loadFirebaseData();

  }

  handleClick(app, item) {
    return function (event) {
      //alert('eventually this will delete the item ' + item.name);
      console.log(app.state.inventory[0]);
      for (var i = 0; i < app.state.inventory.length; i++) {
        for (var key in app.state.inventory[i]) {
          var inv = app.state.inventory[i][key].inventory;

          if (inv.name == item.name) {
            firebase.database().ref('Inventory/' + key).set(null);
            delete app.state.inventory[i][key];

            app.setState({
              inventory: app.state.inventory,
              submitted: true,
              id: uuid.v1()
            })
          }//app._loadFirebaseData();
        }
      }
    }
  }
}

export default App;
