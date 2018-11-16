import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { connect } from 'react-redux';

let start = '2014-12-30T18:06:17.762Z';
let end = '2020-01-05T18:06:17.762Z';

class Results extends Component {

    state = {
        open: false,
        name: '',
        email: '',
        message: '',
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    unitStepSize: 1,
                    time: {
                        unit: 'year',
                        suggestedMax: '2020-01-05T18:06:17.762Z',
                        suggestedMin: '2014-12-30T18:06:17.762Z',
                    },
                    distribution: 'linear'
                }],
            }
        }
    }

    handleChange = property => event => this.setState({ [property]: event.target.value });

    handleSubmit = property => event => {
        event.preventDefault();
        axios.post('/email', {
            content: { name: this.state.name, email: this.state.email, subject: property, message: this.state.message },
            siteName: this.props.sites[0].siteName,
            fundStartDate: this.props.sites[0].fundStartDate,
            fundEndDate: this.props.sites[0].fundEndDate,
            location: this.props.sites[0].location,
            generator: this.props.generator[0],
            selectedSite: this.props.selectedSite.type,
            totalDieselCost: this.props.dieselCalculation.totalDieselCost,
            address: this.props.sites[0].address
        }).then(response => {
            console.log('Response is:', response.data);
            this.setState({
                open: true,
                name: '',
                email: '',
                message: '',
            });
        }).catch(error => console.log('Error in POST:', error))
    }



    render() {
        const datasets = [{
            label: 'Time to cover initial investment',
            data: [{ //these values will be set dynamically when user enters info
                x: this.props.sites.length ? new Date(this.props.sites[0].fundStartDate) : start,
                y: this.props.selectedSite.total_price || 25000
            }, {
                x: this.props.dieselCalculation.payOffDate,
                y: 0
            }],
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)'
            ],

            borderWidth: 1,

        }, {
            label: 'Solar energy savings',
            data: [{
                x: this.props.dieselCalculation.payOffInTime ?
                    this.props.dieselCalculation.payOffDate : new Date(this.props.sites[0].fundStartDate),
                y: 0
            }, {
                x: this.props.sites.length ? this.props.sites[0].fundEndDate : end,
                y: this.props.dieselCalculation.payOffInTime ?
                    this.props.dieselCalculation.totalDieselCost - this.props.selectedSite.total_price : 0
            }],
            backgroundColor: [
                'rgba(100, 100, 300, 0.4)'
            ],
            borderColor: [
                'green'
            ],
            borderWidth: 1
        }, {
            label: 'Cost of Diesel',
            data: [{
                x: this.props.sites.length ? this.props.sites[0].fundStartDate : start,
                y: 0
            }, {
                x: this.props.sites.length ? this.props.sites[0].fundEndDate : end,
                y: this.props.dieselCalculation.totalDieselCost || 35000
            }],
            backgroundColor: [
                'grey'
            ],
            borderColor: [
                'grey'
            ],
            borderWidth: 1
        }]


        return (<div>
            <h2 className="heading">Results</h2>
            <div style={{maxWidth: "90%", margin: "auto"}}>
            <Line data={{ datasets: datasets }} options={this.state.options} />
            </div>
            <h3>Time to pay off: {parseInt(this.props.dieselCalculation.timeToPayOff)} months</h3>
            {this.props.dieselCalculation.payOffInTime ?
                <h3>Total Savings: ${parseInt(this.props.dieselCalculation.totalDieselCost - this.props.selectedSite.total_price)}</h3> :
                <h3>Monthly budget needed: ${parseInt(this.props.selectedSite.total_price / this.props.dieselCalculation.timeline)}</h3>}
        </div>)
    }
}

const mapStateToProps = state => ({
    sites: state.sites,
    selectedSite: state.selectedSite,
    dieselCalculation: state.dieselCalculation,
    generator: state.generator
});


export default connect(mapStateToProps)(Results);