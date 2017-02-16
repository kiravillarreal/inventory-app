import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Table } from 'react-bootstrap';

var uuid = require('uuid');
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyDvVjJK-EvJogceDkh9S605MrSk0OwU9VA",
    authDomain: "inventoryapp-66ceb.firebaseapp.com",
    databaseURL: "https://inventoryapp-66ceb.firebaseio.com",
    storageBucket: "inventoryapp-66ceb.appspot.com",
    messagingSenderId: "172765035293"
};
firebase.initializeApp(config);

class App extends Component {
  constructor(props) {

    super(props);
    this.state = {
      inventory: [],
      id: uuid.v1(),
      submitted: false,
      editMode: false,
      editFields: [],
      typed: '',
      change: []
    }

    //Handle Actions
    this._updateFireBaseRecord = this._updateFireBaseRecord.bind(this); //Updates the firebase record
    this._setFireBaseDataEditTable = this._setFireBaseDataEditTable.bind(this); //Sets the UUID we are going to modify
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
    var editView;
    var output;

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
    console.log(this.state.inventory);
    rows = this.state.inventory.map(function (item, index) {

      return Object.keys(item).map(function (s) {
        return (
          (
            <tr key={s}>
              <th> {item[s].inventory.name} </th>
              <th> {item[s].inventory.description}  </th>
              <th> {item[s].inventory.quantity}  </th>
              <th><button onClick={self.handleClick(self, item[s].inventory)}>Delete</button>
                <button value={item[s].inventory.uuid} onClick={self._setFireBaseDataEditTable}>Edit</button>
              </th>
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

editView = (
      <div>
        <h2>Edit Mode</h2>
        <form onSubmit={this._updateFireBaseRecord}>
          <input type="text" value={this.state.editFields.name} onChange={this._handleFirebaseFormChange}  name="name" />
          <input type="text" value={this.state.editFields.description} onChange={this._handleFirebaseFormChange}  name="description" />
          <input type="text" value={this.state.editFields.quantity} onChange={this._handleFirebaseFormChange}  name="quantity" />
          <input type="text" className="hideinput" value={this.state.editFields.uuid} onChange={this._handleFirebaseFormChange} name="uuid" />
          <button type="submit" type="submit" >Submit</button>
        </form>
      </div>
    );



    if (this.state.editMode) {
      output = (
        <div className="App">
          <div className="App-header">
            <h2>Inventory App</h2>
          </div>
          <div className="text-center">
            {editView}
          </div>
        </div>
      );
    } else {
      output = (
        <div>
          <div className="App-header">
            <h2>Inventory App</h2>
          </div>
          <div className="text-center">
            {inputForm}
            <br />
            {table}
          </div>
        </div>
      );
    }


    return output;

  }


  onSubmit(event) {
    event.preventDefault();

    const details = {}
    const id = uuid.v1();


    //Go through each element in the form making sure it's an input element
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      } else {
        el.value = null
      }
      details['uuid'] = id;
    });

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
    firebase.database().ref('inventoryapp/' + this.state.id).set({
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

  _handleFirebaseFormChange(event) {
    console.log("Field Updated");
    this.props.onChange(event.target.value);
  }

handleChange(event){
     var change = {};
     change[event.target.name] = event.target.value;
     this.setState({editFields: change});
  }

  _setFireBaseDataEditTable(event) {
    event.preventDefault();

    const recordId = event.target.value;

    console.log("The firebase uuid is", event.target.value);

    this.setState({
      editMode: true,
      editUUID:recordId,
      editFields: []
    });



    var self = this;

    //Query the firebase data
    firebase.database().ref().child("inventoryapp").orderByChild("uuid").on('value',
      (snapshot) => {
        snapshot.forEach(function (child) {
          //console.log(child.val()) // NOW THE CHILDREN PRINT IN ORDER
          var value = child.val();
          var name = value.inventory.name;
          var quantity = value.inventory.quantity;
          var description = value.inventory.description;
          var uuid = value.inventory.uuid;

          var editFields = {};

          if (uuid === recordId) {
            //console.log(value);
            editFields["name"] = name;
            editFields["quantity"] = quantity;
            editFields["description"] = description;
            editFields["uuid"] = uuid;

            self.setState({ editFields: editFields });

          }
        });
      }
    )
  }

  _updateFireBaseRecord(event) {
    event.preventDefault();

    //Getting the values of each child type input
    var details = {};
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      }
    });

    console.log("Data has been submitted!!!!");

   

    var uuid = details["uuid"];
    var self = this;


    console.log("update uuid " + uuid);

    firebase.database().ref().child('/inventoryapp/' + uuid)
      .update({ inventory: details });

    this._loadFirebaseData();

     //Resetting the property value
    this.setState({
      editMode: false
    });
  }

_handleClick(event) {
    event.preventDefault();

    //console.log(event.target.value);
    //Remove one element
    var uuid = event.target.value;

    firebase.database().ref().child('inventoryapp/' + uuid).remove();

    //Reload the data
    this._loadFirebaseData();
  }

}

export default App;
