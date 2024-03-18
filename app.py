from flask import Flask, jsonify, render_template
import json
from json2html import *

app = Flask(__name__)

# Load data from the provided file
with open('static/soccer_small.json') as f:
    players_data = json.load(f)
    all_data = f.read()


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/players', methods=['GET'])
def get_players():
    return render_template("data.html")


@app.route('/players/<name>', methods=['GET'])
def get_player(name):
    player = next((p for p in players_data
                   if p['Name'].lower() == name.lower()), None)
    if player:
        return render_template("query.html",
                               page_title=name,
                               data_table=json2html.convert(json=player))
    else:
        return jsonify({"error": "Player not found"}), 404


@app.route('/clubs', methods=['GET'])
def get_clubs():
    clubs = {player['Club'] for player in players_data}
    club_data = {club: [player['Name'] for player in players_data
                        if player['Club'] == club]
                 for club in clubs}
    return render_template("query.html",
                           page_title="Clubs",
                           data_table=json2html.convert(json=club_data))


@app.route('/countries', methods=['GET'])
def get_countries():
    countries = {player['Nationality'] for player in players_data}
    country_data = {country: [player['Name'] for player in players_data
                              if player['Nationality'] == country]
                    for country in countries}
    return render_template("query.html",
                           page_title="Nationality",
                           data_table=json2html.convert(json=country_data))


@app.route('/attributes', methods=['GET'])
def get_attributes():
    attributes = list(players_data[0].keys())
    return render_template("query.html",
                           page_title="Attributes",
                           data_table=json2html.convert(json=attributes))


if __name__ == '__main__':
    app.run(debug=True)
