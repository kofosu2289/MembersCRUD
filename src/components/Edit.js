import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Edit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      member: {}
    };
  }

  componentDidMount() {
    axios.get('/api/member/'+this.props.match.params.id)
      .then(res => {
        this.setState({ member: res.data });
        console.log(this.state.member);
      });
  }

  onChange = (e) => {
    const state = this.state.member
    state[e.target.name] = e.target.value;
    this.setState({member:state});
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { firstName, lastName, city, } = this.state.member;

    axios.put('/api/member/'+this.props.match.params.id, { firstName, lastName, city, })
      .then((result) => {
        this.props.history.push("/show/"+this.props.match.params.id)
      });
  }

  render() {
    return (
      <div class="container">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h3 class="panel-naziwsko">
              Edit Member
            </h3>
          </div>
          <div class="panel-body">
            <h4><Link to={`/show/${this.state.member._id}`}><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> Go Back</Link></h4>
            <form onSubmit={this.onSubmit}>
              <div class="form-group">
                <label for="firstName">First Name:</label>
                <input type="text" class="form-control" name="firstName" value={this.state.member.firstName} onChange={this.onChange} placeholder="First Name" />
              </div>
              <div class="form-group">
                <label for="naziwsko">Last Name:</label>
                <input type="text" class="form-control" name="lastName" value={this.state.member.lastName} onChange={this.onChange} placeholder="Last Name" />
              </div>
              <div class="form-group">
                <label for="city">City:</label>
                <input type="text" class="form-control" name="city" value={this.state.member.city} onChange={this.onChange} placeholder="City" />
              </div>
              <button type="submit" class="btn btn-default">Submit</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Edit;