import root.server as server

if __name__ == "__main__":
    server.start_server()
    
    foo = """def new_function(_message):
                // do some operation
                return some_value"""

    server.new_event("event/new", "event/response", foo)