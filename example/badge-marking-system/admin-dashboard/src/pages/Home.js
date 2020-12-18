import React, { useState, useEffect } from 'react'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { ToastProvider, useToasts } from 'react-toast-notifications';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import env from "react-dotenv";

const ipAddress = env.SERVER_IP;
const serverPort = env.SERVER_PORT;
const mosquittoPort = env.BROKER_PORT;

var mqtt    = require('mqtt');
var client  = mqtt.connect(`ws://${ipAddress}:${mosquittoPort}`, { clientId: "web-client" });
var addEmployee
var deleteEmployee
var makeToast

client.subscribe('employee/arrived');
client.subscribe('employee/left');
client.subscribe('employee/ask/response');

client.on('message', function (topic, message) {
  const json = JSON.parse(message)
  if(topic === 'employee/arrived') {
    if(json['inLate']) {
      makeToast(`${json['name']} arrived in late`, 'warning')
    } else {
      makeToast(`${json['name']} arrived`, 'success')
    }
    addEmployee(json)
  } else if(topic === 'employee/left') {
    if (json['leftShift']) {
      makeToast(`${json['name']} left the shift`, 'error')
    } else {
      makeToast(`${json['name']} went away`, 'info')
    }

    deleteEmployee(json)
  } else if(topic === 'employee/ask/response') {
    makeToast(`${json['name']} says "${json['message'].slice(0, 15)}..."`, 'info')
  }
});

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    fontSize: 16,
    fontWeight: "bold"
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  head: {
    fontSize: 16,
    fontWeight: "bold"
  },
}))(TableRow);

function Home() {
  const classes = useStyles();
  const { addToast } = useToasts();

  const [data, setData] = useState({ employees: [] });

  addEmployee = (json) => {
    setData({employees: [...data.employees, json]});
  }

  deleteEmployee = (json) => {
    var temp = [...data.employees];
    temp.splice(data.employees.indexOf(json), 1);
    setData({employees: temp})
  }

  makeToast = (message, type) => {
    addToast(message, { appearance: type })
  }
 
  useEffect(() => {
    axios(`http://${ipAddress}:${serverPort}/getPresentEmployees`).then(res => setData(res.data));
  }, []);

  return (
    <div className='home'>
      <div className="container">
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>UUID</StyledTableCell>
                <StyledTableCell align="right">Name</StyledTableCell>
                <StyledTableCell align="right">Start shift</StyledTableCell>
                <StyledTableCell align="right">End shift</StyledTableCell>
                <StyledTableCell align="right">Arrived</StyledTableCell>
                <StyledTableCell align="right">In late</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.employees.map((employee) => (
                <StyledTableRow key={employee.uuid}>
                  <TableCell component="td" scope="row">
                    {employee.uuid}
                  </TableCell>
                  <TableCell align="right">{employee.name}</TableCell>
                  <TableCell align="right">{employee.startShift}</TableCell>
                  <TableCell align="right">{employee.endShift}</TableCell>
                  <TableCell align="right">{employee.arrived}</TableCell>
                  <TableCell align="right" className={employee.inLate ? "text-danger" : "text-success"}>
                    {employee.inLate ? "Yes" : "No"}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Home;
