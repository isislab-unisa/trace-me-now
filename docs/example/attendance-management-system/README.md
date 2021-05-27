# Attendance Management System

Employee attendance tracking is a priority for many employers, making easier to schedule work shift and identifying any attendance issues. Nowadays, offices and factories provide access badges to their employees to report the start, the end of the work shift, and the breaks, checking the respect of the working time. However, this kind of system is not safe and can be easily tricked, for example, by clocking in and then leaving the workplace or by giving the badge to a colleague who clocks in for multiple employees not present. Therefore, access badges are not reliable and, in addition, the infrastructure needed to realize the system is usually expensive since it requires proprietary hardware and software and frequent maintenance.

An architecture composed of an IPS and an application specifically designed can overcome the problems of traditional access card systems, introducing innovative solutions. 

The Attendance Management System(AMS) developed with TraceMeNow aims to be one of these solutions, providing an effective and low-cost system easy to install and maintain.
The idea is to turn employees' smartphones into badges using an Android application. A group of devices installed within the workplace senses employees' movements reporting the information to a central server monitoring the building. Finally, a web interface will provide the access to all the information of the system.

## Implemented Requirements

A mobile application turns the smartphone into an access badge automatically detected and tracked when located within the workplace. 
Employees' smartphones will be the main target for such a purpose, acting as the badge themselves; the building, from the other side, needs to be able to sense employees movements automatically, without acting on the system itself, and report those information to, for instance, a web platform.

- **RF_1:** The end user (*aka* the employee) can sign up to the system using the application, by specifying name, surname, start-shift time and end-shift time;
- **RF_2:** The system keeps track of employees, their arrival and outgoing time, and notify when an employee leaves the company during the shift;
- **RF_3:** Both the users and the administrator will be notified when an employee leaves the company during the shift; the employee needs to report a valid reason for leaving the building during the working time;
- **RF_4:** The system provides a web interface to monitor movements and employees. The interface provides the list of all the employees, those within the workplace or who left it at least once, a section with all the employees' messages;

Each component of the system has a dedicated module with more information about the implementaion.