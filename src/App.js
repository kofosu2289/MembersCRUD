import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { request } from 'https';
//import { config } from './settings';

var rp = require('request-promise');
var tzlookup = require("tz-lookup");
var config = require('./settings');



class App extends Component {

  constructor(props) { 
    super(props);
    this.state = {
      members: [],
      apiKey : config.apiKey,
      currentPage: 1,
      membersPerPage:10,
      query: '',
      key:"firstName",
    };
    this.handleClick = this.handleClick.bind(this);
    this.sortBy = this.sortBy.bind(this);
    
  }
// search bar input
  handleInputChange = () => {
    this.setState({
      query: this.search.value
    })
  }
// clicking on pages 
  handleClick(event) {
    this.setState({
      currentPage: Number(event.target.id)
    });
  }
  // change sorting key
  sortBy(e){
    this.setState({key:e.target.id });
  }

  logout = () => {
  localStorage.removeItem('jwtToken');
  window.location.reload();
  }
  // part of sorting function - to sort array of objects by value
  compareValues = ( key, order='asc') => {
    return function(a, b) {
      if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
          return 0; 
      }
  
      const varA = (typeof a[key] === 'string') ? 
        a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? 
        b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order == 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  componentWillMount() {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken'); // checking if someone has jwt Token
    axios.get('/api/member')  // getting list of members from DB
      .then(res => {
        console.log(res.data);

        res.data.map((member)=>{      // for each member, check his location to get his TimeZone and show exact time.
          let options = {
            uri: 'http://api.openweathermap.org/data/2.5/weather?q='+member.city+"&appid="+this.state.apiKey,
            json: true
          }
          rp(options)               // Request promise asynchronusly to weather API 
            .then((body)=>{
            
            let lat = body.coord.lat;
            let lon = body.coord.lon;
            let cityTimeZone =tzlookup(lat, lon);     // use tzlookup to get someone's TimeZone
            member.timeZone = new Date().toLocaleTimeString(undefined,{timeZone:cityTimeZone}); // check actual time for TimeZone
          }).catch((error)=>{
            member.timeZone="Can't find";
          }).then(()=>{this.setState({ members: res.data });})
        
          
        })
      })
      .catch((error) => {                 // catch error 401 - unauthorized and send to login page
        if(error.response.status === 401) {
          this.props.history.push("/login");
        }
      });

  }
  

  render() {

    const { members, currentPage, membersPerPage } = this.state;

        const unsortedMembers = members.filter((member=> member.firstName.startsWith(this.state.query) // searching for members that meet requirements
        || member.lastName.startsWith(this.state.query)
        || member.city.startsWith(this.state.query)))

        let sortedMembers = unsortedMembers.sort(this.compareValues(this.state.key));   // sorting members by a key - firstName, lastName or city

        // Logic for displaying proper number of members per page
        const indexOfLast = currentPage * membersPerPage;
        const indexOfFirst = indexOfLast - membersPerPage;
        const currentMembers = sortedMembers.slice(indexOfFirst, indexOfLast);

        const renderMembers = currentMembers.map((member) => { // creating list of members
          return (
              <tr>
                <td><Link to={`/show/${member._id}`}>{member.firstName}</Link></td>
                <td>{member.lastName}</td>
                <td className=" d-none d-sm-table-cell">{member.city}</td>
                <td className=" d-none d-sm-none d-md-table-cell">{member.timeZone}</td>
              </tr>
            )
        });

        // Logic for displaying page numbers
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(sortedMembers.length / membersPerPage); i++) {
          pageNumbers.push(i);
        }

        const renderPageNumbers = pageNumbers.map(number => {
          return (
            <li class="page-item">
            <a className="page-link"
              key={number}
              id={number}
              onClick={this.handleClick}>
              {number}
            </a>
            </li>
          );
        });

    return ( //render members list
      <div class="container">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h3>
              Members &nbsp;
              {localStorage.getItem('jwtToken') &&
                <button class="btn btn-primary" onClick={this.logout}>Log Out</button> //logout button
              }
            </h3>
            <form>
            <input
              placeholder="Search"
              ref={input => this.search = input} // search input
              onChange={this.handleInputChange}
            />
           </form>    
          </div>
          <div class="panel-body">
          <h4><Link to="/create"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Add</Link></h4> 
            <table class="table table-stripe"> 
              <thead>
                <tr>
                  <th>First Name <button type="button" id="firstName"  onClick={ this.sortBy } class="btn btn-primary btn-sm">A-Z</button> </th>
                  <th>Last Name <button type="button" id="lastName" onClick={this.sortBy} class="btn btn-primary btn-sm">A-Z</button></th>
                  <th className=" d-none d-sm-table-cell">City <button type="button" id="city" onClick={this.sortBy}class="btn btn-primary btn-sm">A-Z</button></th>
                  <th className=" d-none d-sm-none d-md-table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
              {renderMembers}                
              </tbody>
            </table>
            <nav aria-label="Page navigation">
            <ul class="pagination">
              {renderPageNumbers}
            </ul>
            </nav>
          </div>
        </div>
      </div>
    );
  }
}

export default App;




