# Trace Me Now
TraceMeNow, an open-source framework for developing applications exploiting Indoor Positioning System (IPS), based on Bluetooth Low Energy, compatible with standard and cheap devices, suitable for any scenario. TraceMeNow allows programmers to build software thanks to a modular architecture simplifying the implementation of tracking and localization modules within an indoor environment using low-cost devices. Each component of the framework has a dedicated library with default functionalities designed to support the developer in several situations. Additionally, every method can be easily customized, and new features can be introduced if needed. Furthermore, the framework includes the possibility to exploit cloud computing resources to gain scalability and manage large scenarios.

The system implemented with the framework consists of mobile nodes, whose position is unknown, and several localization nodes, with known locations, placed within the indoor environment communicating with an application module acting as a server.


The position estimation and the communication between the nodes rely on BLE.
BLE is designed for short-range wireless transmission of small amounts of data with low energy and cost, granting a convenient trade-off between power consumption and accuracy. TraceMeNow exploits the one-to-many communication provided by BLE called broadcasting, enabling data sent to any listening device in range. Specifically, the mobile nodes transmit BLE packets in broadcast, allowing the nearby anchor node to detect and localize them.

TraceMeNow is designed to guide the developer through the implementation and integration of the IPS within any application, thanks to the libraries available for each system component. In detail, the framework proposes several default implementations useful in most scenarios as well as methods to modify the existing features and/or introduce new ones. For instance, other localization techniques can be used, or additional components can be included.

*More informations about each component are avaible in the dedicated README file.*

## General Architecture

The modular architecture of TraceMeNow includes mobile nodes, tracking nodes, the communication protocol, and the application module. The mobile node can be any device with BLE and Wi-Fi interface on which an application built with TraceMeNow is installed. This enables the node to continuously broadcast a message with some defined information via BLE while the Wi-Fi interface is used to interact with the application module using a specific communication protocol.
A group of tracking nodes is responsible for the localization process and consists of embedded systems supporting the two wireless technologies used. TraceMeNow provides the localization system exploiting the BLE interface and the communication protocol using Wi-Fi.
The application module handles the whole IPS and can be hosted on a Cloud architecture or an on-premise one. It contains a lightweight server engine, a database to store the collected data, maintaining the global status of the system, and the TraceMeNow communication protocol based on the Event/Notification system.

![General Architecture](img/generalArchitecture.png "TraceMeNow general Architecture") 
