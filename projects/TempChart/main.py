import json


def parse_json(file_name, parameter):
    d = json.load(file_name)
    output = ""

    # get the state name
    state_name = d["description"]["title"].partition("June")[0][:-1]
    output += ("{\"state\": \"" + state_name + "\", \"data\": [")

    # get all the years
    for key in d["data"]:
        output += ("{\"year\": \"" + key[:4] + "\", \"" + parameter + "\": " + d["data"][key]["value"] + "}, ")

    output = output[:-2]
    output += "]}"

    return output


def iter_files(parameter):
    output = "["

    for i in range(0, 49):
        file_name = parameter + "/data (" + str(i) + ").json"
        if i == 0: file_name = parameter + "/data.json"

        with open(file_name) as f:
            cur_obj = parse_json(f, parameter)
            output += cur_obj
        output += ", "

    output = output[:-2]
    output += "]"

    with open(parameter + ".json", "w") as text_file:
        text_file.write(output)


iter_files("temperature")
iter_files("precipitation")
