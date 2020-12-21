# Badge Marking System

One of the main priorities for medium- and big-size companies is keeping track of their employees, in particular what concerns about their arrival and outgoing times, based on their working schedules. During the years, companies have tackled with many forms of cheating by using a classic badge marker system, such as just marking the badge and going away, or even a single employee marking several badges for non-present collogues. An ideal system could use employees' smartphones to keep track of them, so that they will not need to use and mark a badge anymore, but their smartphone will be the badge itself. This means that, as soon as they enter the building, the system will be capable to automatically sense a new-entering employee and mark him/her as entered with the corrisponding arrival time; detect when going out during the working time; detect the outgoing time when his/her turn is finished, and much more. A web platform which monitors all these movements could be useful for who wants to know these information.

This is just an example of how such system could look like, and it shows how easy is to build a system that requires indoor localization and tracking functionalities using Trace Me Now.

## Implemented Requirements

Employees' smartphones will be the main target for such a purpose, acting as the badge themselves; the building, from the other side, needs to be able to sense employees movements automatically, without acting on the system itself, and report those information to, for instance, a web platform.

- **RF_1:** The end user (*aka* the employee) can sign up to the system through the app itself, by specifying name, surname, start-shift time and end-shift time;
- **RF_2:** The system keeps track of employees, their arrival and outgoing time, and notify when an employee leaves the company during the shift;
- **RF_3:** Both the users and the administrator need to be notified when an employee leaves the company during the shift; for instance, the employee can report a valid reason for leaving the building during the working time;
- **RF_4:** The system provides an admin platform to monitor those movements and to be notified in case of anomalies, to see a list of all the employees, a list of on-site employees, and a section when employees report messages;

Check every module of the system to know more about them.