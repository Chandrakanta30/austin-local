import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import ButtonGroup from '@material-ui/core/ButtonGroup';
const axios = require('axios');

console.log("home");
class Ordercustomization extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orders_list:[],
      list: [],
      product_images:[],

      orderDetails: false,
      orderDetailsData:{},
      isHidden:false,
      
    }
    this.handleEvent = this.handleEvent.bind(this)
  }

  componentDidMount() {
    const config = {     
      headers: { 'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*',
              'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS', }
      }
    axios.get('https://9f45415c382d.ngrok.io/orders_list',config)
      .then(res => {
        console.log("order_list_responce");
        console.log(res.data);
        this.setState({
          list:res.data.ordes_list
          })
          console.log(this.state.list);
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) { if (prevState.name !== this.state.name) { this.handler() } }

  componentWillUnmount() {
    
  }

  // Prototype methods, Bind in Constructor (ES2015)
  handleEvent() {}

  // Class Properties (Stage 3 Proposal)
  handler = () => { this.setState() }
  showOrderListing=()=>{
    this.setState({isHidden:false})
}
  loadOrderDetailsById=(order_id)=>{
    console.log(order_id);
    const config = {     
      headers: { 'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*',
              'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS', }
      }
    axios.get('https://9f45415c382d.ngrok.io/order_details?order_id='+order_id,config)
      .then(res => {
        console.log(res.data.order_details);
        this.setState({
          orderDetailsData:res.data.order_details,
          product_images:res.data.images
          })
        //   console.log(this.state.orderDetailsData);
         
       this.setState({isHidden:true});
      })
  }
  OrderDetailsView = () => {
    const classes = makeStyles({
        table: {
          minWidth: 650,
        },
      });
      const cardStyle = makeStyles({
          root: {
            minWidth: 275,
          },
          bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)',
          },
          title: {
            fontSize: 14,
          },
          pos: {
            marginBottom: 12,
          },
        });
        const bull = <span className={cardStyle.bullet}>•</span>;
        
   return (
    
    <Grid item xs={12} >
    <Button onClick={this.showOrderListing}>Back</Button>
    <Grid container justify="center">
     {/* customer detials */}
        <Grid item xs={4}>
           <Card className={classes.root}>
                <CardContent>
                    <Typography className={cardStyle.title} color="textSecondary" gutterBottom>
                   Customer details
                    </Typography>
                   <p>Customer name:{this.state.orderDetailsData.shipping_address.first_name}</p>
                   <p>Customer Address:{this.state.orderDetailsData.shipping_address.address1},{this.state.orderDetailsData.shipping_address.address2},{this.state.orderDetailsData.shipping_address.city},{this.state.orderDetailsData.shipping_address.province}</p>
                   <p>Customer Address:{this.state.orderDetailsData.shipping_address.country},{this.state.orderDetailsData.shipping_address.zip}</p>
                   <p>Total price:{this.state.orderDetailsData.total_price}</p>
                </CardContent>
            </Card>
        </Grid>
        {/* Order details */}
        <Grid item xs={4}>
           <Card className={classes.root}>
    
           {this.state.orderDetailsData.line_items.map((row) => (
                 <CardContent>
                 <Typography className={cardStyle.title} color="textSecondary" gutterBottom>
                 Order details
                 </Typography>
                 <Typography variant="p" component="p">
                 Product id:{row.variant_id}<br/>
                 Product title:{row.title}<br/>
                 Quantity: {row.quantity}
                 </Typography>
             </CardContent>
             ))}
            </Card>
        </Grid>
    
        {/* Order assets */}
        <Grid item xs={4}>
           <Card className={classes.root}>
                <CardContent>
                    <Typography className={cardStyle.title} color="textSecondary" gutterBottom>
                    Product Preview
                    </Typography>
                    {this.state.product_images.map((row) => (
                        <img style={{width: '100px'}}  src={row.src}></img>
                     ))}

                </CardContent>
            </Card>
        </Grid>
      
    </Grid>
    </Grid>
   );
}
  OrderListView=()=>{
    const classes = makeStyles({
        table: {
          minWidth: 650,
        },
      });
      const noPointer = {cursor: 'default'};

      const cardStyle = makeStyles({
          root: {
            minWidth: 275,
          },
          bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)',
          },
          title: {
            fontSize: 14,
          },
          pos: {
            marginBottom: 12,
          },
        });
        const bull = <span className={cardStyle.bullet}>•</span>;
        return (
            <>
            <p>Orde listing</p>
            <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="Order Details">
              <TableHead>
                <TableRow>
                  <TableCell>Order Id</TableCell>
                  <TableCell>User name</TableCell>
                  <TableCell>Total price</TableCell>
                  <TableCell>No of items</TableCell>
                  <TableCell>Store Order status</TableCell>
                  <TableCell>Custom Order Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody style={noPointer}>
                {this.state.list.map((row) => (
                  <TableRow key={row.id} style={noPointer}>
                    <TableCell  onClick={() => this.loadOrderDetailsById(row.id)}>
                      {row.id}
                    </TableCell>
                    <TableCell component="th" scope="row"  onClick={() => this.loadOrderDetailsById(row.id)}>
                      {row.customer.first_name} {row.customer.last_name}
                    </TableCell>
                    <TableCell  onClick={() => this.loadOrderDetailsById(row.id)}>{row.currency} {row.total_price}</TableCell>
                    <TableCell  onClick={() => this.loadOrderDetailsById(row.id)}>{row.line_items.length}</TableCell>
                   
                    <TableCell>Store order status</TableCell>
                    <TableCell><Select
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={row.order_status}
                    name={row.id}
                    onChange={this.customStatusUpdate}
                >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="0">Not set</MenuItem>
                <MenuItem value="Placed">Placed</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select></TableCell>
                  </TableRow>
                ) )
                }
              </TableBody>
            </Table>
          </TableContainer>
          </>
        )


}
  render() {
    return (
      <>
        {!this.state.isHidden && this.OrderListView()}
    {/* <Button >Click</Button> */}

    {this.state.isHidden && this.OrderDetailsView()}
      </>
    )
  }
}
export default Ordercustomization;