import React, { Component } from 'react';
import { Container, makeStyles } from "@material-ui/core";
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
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import CircularProgress from '@material-ui/core/CircularProgress';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import TablePagination from '@material-ui/core/TablePagination';

const axios = require('axios');
const styles = {
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  },
  loader: {
    display: 'flex',
    '& > * + *': {
      marginLeft: 20
    },
    position: "absolute",
    alignItems:"center",
    justifyContent:"center",
    width: "100%",
    height: "100%",
    "background-color": "rgba(0,0,0,0.3)"
  },
  table:{
    fontSize:14
  },
  table_head:{
    fontSize:16
  },
  select_input:{
    width: "100%",
    fontSize: 14
  },
  card:{
    boxShadow:"0 0 20 -10 rgba(0,0,0,.2)",
    borderRadius:8,
  },
  mb_20:{
    marginBottom:20
    
  },
  label:{
    color: "#aaa",
    "text-transform": "uppercase",
    "font-size": 12
  },
  text:{
    fontSize: 16,"font-weight": 500
  }
};

console.log("home");
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orders_list:[],
      list: [],
      product_images:[],
      anchorEl:null,
      orderDetails: false,
      orderDetailsData:{},
      isHidden:false,
      loaderStatus:false,
      page:0,
      rowsPerPage:1
    }
    this.handleEvent = this.handleEvent.bind(this);
  
  }

  async componentDidMount() {
    this.setState({loaderStatus:true});
    const config = {     
      headers: { 'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*',
              'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS', }
      }
   await axios.get('orders_list',config)
      .then(res => {
        // async res.data.ordes_list.forEach(ele=>{
        //   await ele.
        // })
        this.setState({
          list:res.data.ordes_list,
          loaderStatus:false
          })
          console.log(this.state.list);
        res.data.ordes_list.forEach(async (ele,index) =>{

       await axios.get('https://dev.imprintnext.io/austin/wc/designer/api/v1/vendor-order/order-status/'+ele.id)
          .then((response) => {
            
            if(response.data.status===1){
              var temp=this.state.list;
              console.log(response.data.status);
              console.log(response.data.data.order_status);
              ele.orderstatus=response.data.data.order_status;
              temp[index].ordes_list=response.data.data.order_status;
              this.setState({
                list:temp
                })
            }
          });
        })
        console.log(res.data.ordes_list);
        
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
  handleClick = (event) => {
    this.setState({
      anchorEl:event.currentTarget
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl:null
    });
  };
  loadOrderDetailsById=(order_id)=>{
    this.setState({loaderStatus:true});
    const config = {     
      headers: { 'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*',
              'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS', }
      }
    axios.get('order_details?order_id='+order_id,config)
      .then(res => {
        this.setState({
          orderDetailsData:res.data.order_details,
          product_images:res.data.images,
          loaderStatus:false
          })
         this.setState({isHidden:true});
      })
  }

  camelize=(str)=>{
    if(str=='paid'){
      return 'Paid';
    } else if(str=='pending'){
      return 'Pending';
    } else if(str=='authorized'){
      return 'Authorized';
    }else if(str=='partially_paid'){
      return 'Partially Paid';
    }else if(str=='partially_refunded'){
      return 'Partially refunded';
    }else if(str=='refunded'){
      return 'Refunded';
    } else if(str=='voided'){
      return 'Voided';
    }else{
      return "Undefined";
    }
  }
  handleChangePage=(event, newPage)=>{
   this.setState({page:newPage});
  }
  handleChangeRowsPerPage=(event)=>{
    console.log("handleChangeRowsPerPage");
    this.setState({page:0,rowsPerPage:event.target.value});

  }
  getCurrentOrderSatatus=(index)=>{
    console.log(this.state.list[index].id);
    axios.get('https://dev.imprintnext.io/austin/wc/designer/api/v1/vendor-order/order-status/'+this.state.list[index].id)
  .then((response) => {
    console.log(response.data.status);
    if(response.data.status==1){
      const temp=this.state.list;
      console.log(response.data.data.order_status);
      temp[index].orderstatus=response.data.data.order_status;
      this.setState({
        list:temp
      });
    }
  });
  }
  
  OrderDetailsView = () => {
    const { classes, children, className, ...other } = this.props;
   return (
    <Grid item xs={12} >
     
    <Button variant="contained"
        color="#bdbdbd"
        endIcon={<ArrowBackIosIcon />}
         style={{ "float": "right" }} onClick={this.showOrderListing}></Button>
    <Grid container justify="center">
     {/* customer detials */}
        <Grid item xs={4}>
           <Card  className={classes.card} style={{ "margin": "10px","box-shadow":"0 0 20px -10px rgba(0,0,0,.075)!important" }} >
                <CardContent>
                    <Typography className={classes.table_head} color="textSecondary" gutterBottom>
                   Customer details
                    </Typography>
                    <Typography variant="p" component="p">
                    <div className={classes.mb_20}>
                       <label className={classes.label}>Customer name:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.customer.first_name} {this.state.orderDetailsData.customer.last_name}</p>
                      </div>
                      <div className={classes.mb_20}>
                       <label className={classes.label}>Customer Email:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.customer.email}</p>
                      </div>
                      <div className={classes.mb_20}>
                       <label className={classes.label}>Customer Address:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.customer.default_address.name},
                        <br/>{this.state.orderDetailsData.customer.default_address.address1},
                        {this.state.orderDetailsData.customer.default_address.address2},
                        <br/>{this.state.orderDetailsData.customer.default_address.city},{this.state.orderDetailsData.customer.default_address.province},
                        <br/>{this.state.orderDetailsData.customer.default_address.country},{this.state.orderDetailsData.customer.default_address.zip}</p>
                      </div>
                      <div className={classes.mb_20}>
                       <label className={classes.label}>Total price:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.currency} {this.state.orderDetailsData.total_price}</p>
                      </div>
                   </Typography>
                </CardContent>
            </Card>
            <Card className={classes.card} style={{ "margin": "10px" }}>
                <CardContent>
                    <Typography className={classes.table_head} color="textSecondary" gutterBottom>
                  Shipping details
                    </Typography>
                    <Typography variant="p" component="p">
                      <div className={classes.mb_20}>
                       <label className={classes.label}>Shipping address:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.shipping_address.name},
                        <br/>{this.state.orderDetailsData.shipping_address.address1},
                        {this.state.orderDetailsData.shipping_address.address2},
                        <br/>{this.state.orderDetailsData.shipping_address.city},
                        <br/>{this.state.orderDetailsData.shipping_address.province},
                        <br/>{this.state.orderDetailsData.shipping_address.country},
                        {this.state.orderDetailsData.shipping_address.zip}</p>
                      </div>

                      {/* <div className={classes.mb_20}>
                       <label className={classes.label}>Customer Address:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.shipping_address.address1},{this.state.orderDetailsData.shipping_address.address2},{this.state.orderDetailsData.shipping_address.city},{this.state.orderDetailsData.shipping_address.province}</p>
                      </div>
                      <div className={classes.mb_20}>
                       <label className={classes.label}>Customer Address:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.shipping_address.country},{this.state.orderDetailsData.shipping_address.zip}</p>
                      </div>
                      <div className={classes.mb_20}>
                       <label className={classes.label}>Total price:</label>
                        <p className={classes.text}>{this.state.orderDetailsData.currency} {this.state.orderDetailsData.total_price}</p>
                      </div> */}

                   </Typography>
                </CardContent>
            </Card>
            <Card className={classes.card} style={{ "margin": "10px" }}>
                <CardContent>
                    <Typography className={classes.table_head} color="textSecondary" gutterBottom>
                      Billing Details
                    </Typography>
                    <Typography variant="p" component="p">
                    <div className={classes.mb_20}>
                       <label className={classes.label}> Customer name:</label>
                       <p className={classes.text}>{this.state.orderDetailsData.billing_address.name},
                       <br/>{this.state.orderDetailsData.billing_address.address1},{this.state.orderDetailsData.billing_address.address2},
                       <br/>{this.state.orderDetailsData.billing_address.city},{this.state.orderDetailsData.billing_address.province},
                       <br/>{this.state.orderDetailsData.billing_address.country},{this.state.orderDetailsData.billing_address.zip}</p>
                      </div>
                   </Typography>
                </CardContent>
            </Card>
        </Grid>
        {/* Order details */}
        <Grid item xs={8}  spacing={2}>
           <Card  className={classes.card} style={{ "margin": "10px" }}>
           {this.state.orderDetailsData.line_items.map((row,i) => (
                 <CardContent>
                <Grid container justify="center">
                    <Grid item xs={4}  spacing={2}>
                        <img style={{width: '250px'}}  src={this.state.product_images[i].src}></img>
                      
                    </Grid>
                    <Grid item xs={8}  spacing={2}>
                    <Typography className={classes.table_head} color="textSecondary" gutterBottom>
                       Order details
                    </Typography>
                    <Typography >
                    <div className={classes.mb_20}>
                       <label className={classes.label}>Product id:</label>
                        <p className={classes.text}>{row.variant_id}</p>
                    </div>
                    <div className={classes.mb_20}>
                       <label className={classes.label}>Product title:</label>
                        <p className={classes.text}>{row.title}</p>
                    </div>
                    <div className={classes.mb_20}>
                       <label className={classes.label}> Quantity:</label>
                        <p className={classes.text}>{row.quantity}</p>
                    </div>
                    </Typography>
                    </Grid>
                  </Grid>
                 {/* <hr></hr> */}
                 
             </CardContent>
             ))}
            </Card>
        </Grid>
      
    </Grid>
    </Grid>
   );
}
  OrderListView=()=>{
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
          pageroor:{
            width: '100%',
          }
          
        });
        const bull = <span className={cardStyle.bullet}>•</span>;
        const { classes, children, className, ...other } = this.props;
        const {list} = this.state;
        
        return (
            <>
            <Paper className={cardStyle.pageroor}>
            <TableContainer component={Paper}>
            <Table  aria-label="Orders List">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.table_head}>Order Id</TableCell>
                  <TableCell className={classes.table_head}>User name</TableCell>
                  <TableCell className={classes.table_head}>Total price</TableCell>
                  <TableCell className={classes.table_head}>Store Order status</TableCell>
                  <TableCell className={classes.table_head}>Imprintnext Order Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody style={noPointer} >
                {this.state.list.length > 0 && this.state.list.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((row,index) => (
                  <TableRow key={row.id} style={noPointer}>
                    <TableCell  className={classes.table} onClick={() => this.loadOrderDetailsById(row.id)}>
                      {row.order_number}
                    </TableCell> 
                    <TableCell className={classes.table} component="th" scope="row"  onClick={() => this.loadOrderDetailsById(row.id)}>
                      {row.customer.first_name} {row.customer.last_name}
                    </TableCell>
                    <TableCell className={classes.table} onClick={() => this.loadOrderDetailsById(row.id)}>{row.currency} {row.total_price}</TableCell>
                   
                    <TableCell className={classes.table}> {row.cancelled_at ? "Cancelled":this.camelize(row.financial_status)} </TableCell>
                    <TableCell className={classes.table}> {row.orderstatus}
                    </TableCell>
                  </TableRow>
                ) )
                }
                {this.state.list.length == 0 && 
                  <TableRow style={noPointer}>
                    <TableCell  className={classes.table}>
                      No Orders found
                    </TableCell> 
                    
                  </TableRow>
              
                }


              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
        rowsPerPageOptions={[10,25,30]}
        component="div"
        count={this.state.list.length}
        rowsPerPage={this.state.rowsPerPage}
        page={this.state.page}
        onChangePage={this.handleChangePage}
        onChangeRowsPerPage={this.handleChangeRowsPerPage}
      />


      </Paper>
          </>
        )


}


  render() {  
    const { classes, children, className, ...other } = this.props;
    return (
      <>
       <div  >
       <AppBar position="static" style={{padding: "10px 0px"}}>
         <div style={{display: "flex",alignItems:"center",justifyContent:"space-between"}}>

         
    
      
      <div style={{display: "flex",alignItems:"center"}}>
      {/* <Button style={{colour: "white",fontSize:"14px"}} aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleClick}>
        Open Menu
      </Button>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}>Menu 1</MenuItem>
          <MenuItem onClick={this.handleClose}>Menu 2</MenuItem>
          <MenuItem onClick={this.handleClose}>Menu 3</MenuItem>
        </Menu> */}
          <Typography variant="h6" style={{colour: "white",fontSize:"16px",marginLeft:"14px"}} >
            Austin App
          </Typography>
          </div>
          <div>
          <Button style={{colour: "white",fontSize:"14px"}} color="inherit">Imprintnext</Button>
          </div>
        
        
      </div>
      </AppBar>
      {/* <Button className={clsx(classes.root)}>
      Chandrakanta
    </Button> */}
      {this.state.loaderStatus &&  <div className={clsx(classes.loader)}><CircularProgress /></div>}

      {!this.state.isHidden && this.OrderListView()}
      {this.state.isHidden && this.OrderDetailsView()}
    </div>
      
      </>
    )
  }
}

export default withStyles(styles)(Index);
