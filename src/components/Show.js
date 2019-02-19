import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
//import { config } from '../settings';

var rp = require('request-promise');
var tzlookup = require("tz-lookup");
var config = require('../settings');
let weather= {};

class Show extends Component {

  constructor(props) {
    super(props);
    this.state = {
      apiKey : config.apiKey,
      member: {}
    };
  }

  componentDidMount() {
    axios.get('/api/member/'+this.props.match.params.id)
      .then(res => {
        let options = {
            uri: 'http://api.openweathermap.org/data/2.5/weather?q='+res.data.city+"&appid="+this.state.apiKey,
            json: true
        }
        rp(options) // sending request promise to weather API to obtain weather information.
        .then((body)=>{
            let lat = body.coord.lat;
            let lon = body.coord.lon;
            weather.type=body.weather[0].description;
            weather.temp=body.main.temp;
            console.log(body.weather[0].description);
            console.log(body)
            let cityTimeZone = tzlookup(lat, lon); // check time zone with tzlookup
            res.data.timeZone = new Date().toLocaleTimeString(undefined,{timeZone:cityTimeZone});
          }).catch((error)=>{ // handle city names that cannot be found
            console.log(error);
            res.data.timeZone="Can't find";
            weather.type="Nope";
            weather.temp="Nope"
          }).then(()=>{this.setState({ member: res.data });})

      });
  }

  delete(id){
    console.log(id);
    axios.delete('/api/member/'+id)
      .then((result) => {
        this.props.history.push("/")
      });
  }

  render() {
    return (
      <div class="container">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h3 class="panel-title">
              {this.state.member.title}
            </h3>
          </div>
          <div className="row">
            <div class="panel-body col-sm-6">
                <h4><Link to="/"><span class="glyphicon glyphicon-th-list" aria-hidden="true"></span> Go Back to Members</Link></h4>
                <dl>
                <dt>First Name:</dt>
                <dd>{this.state.member.firstName}</dd>
                <dt>Last Name:</dt>
                <dd>{this.state.member.lastName}</dd>
                <dt>City:</dt>
                <dd>{this.state.member.city}</dd>
                </dl>
                </div>
                <div className="panel-body col-sm-6">
                    <dl>
                        <dt>Current Weather In {this.state.member.city}:</dt> 
                        <dd>{weather.type}</dd>
                        <dd>{Math.floor((weather.temp-273)*(9/5) +32)} F</dd>
                        <dt>Local Time: {this.state.member.timeZone}</dt>
                    </dl>

                </div>
            </div>
            <div className="pane-body">
                <Link to={`/edit/${this.state.member._id}`} class="btn btn-success">Edit</Link>&nbsp;
                <button onClick={this.delete.bind(this, this.state.member._id)} class="btn btn-danger">Delete</button>
          
            </div>

        </div>
      </div>
    );
  }
}

export default Show;