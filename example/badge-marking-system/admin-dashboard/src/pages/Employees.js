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

function Employees() {
  const classes = useStyles();

  const [data, setData] = useState({ employees: [] });
 
  useEffect(() => {
    axios(`http://${ipAddress}:${serverPort}/getEmployees`)
    .then(res => setData(res.data))
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
                <StyledTableCell align="right">On-site</StyledTableCell>
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
                  <TableCell align="right">{employee.arrived ? "Yes" : "No"}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Employees;
