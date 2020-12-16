import React, { useState, useEffect } from 'react'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';

const ipAddress = '192.168.1.115'
const serverPort = '8888'
const mosquittoPort = '1883'

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

function Messages() {
  const classes = useStyles();

  const [data, setData] = useState({ messages: [] });
 
  useEffect(() => {
    axios(`http://${ipAddress}:${serverPort}/getMessages`)
    .then(res => { console.log(res.data); setData(res.data) })
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
                <StyledTableCell align="right">Message</StyledTableCell>
                <StyledTableCell align="right">Date</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.messages.map((message) => (
                <StyledTableRow key={message.uuid}>
                  <TableCell component="td" scope="row">
                    {message.uuid}
                  </TableCell>
                  <TableCell align="right">{message.name}</TableCell>
                  <TableCell align="right">{message.message}</TableCell>
                  <TableCell align="right">{message.date.toString()}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Messages;
