"""
    BUDGET PROGRAM
    By: Isaac Lehman


    Options to run server:
    1.
        set FLASK_APP=server.py       (set the current server file to run)
        python -m flask run           (run the server)
    2.
        python server.py              (runs in debug mode)

"""
# set FLASK_APP=hello_world.py  (set the current server file to run)
# python -m flask run           (run the server)

''' ************************************************************************ '''
'''                                   IMPORTS                                '''
''' ************************************************************************ '''
from flask import Flask, render_template
from flask import request, session, flash
from flask import redirect, url_for
from flask import make_response
from flask import g
from flask import jsonify
from datetime import datetime
from datetime import timedelta
import random
import urllib
import sqlite3
import os

''' ************************************************************************ '''
'''                                APP SET UP                                '''
''' ************************************************************************ '''

''' set app, cache time, and session secret key '''
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 # no cache
app.config["SECRET_KEY"] = "!kn4fs%dkl#JED*BKS89" # Secret Key for Sessions

''' ************************************************************************ '''
'''                              DATABASE SET UP                             '''
''' ************************************************************************ '''

''' set database path '''
# get the path to the directory this script is in
scriptdir = os.path.dirname(__file__)
# add the relative path to the database file from there
dbpath = os.path.join(scriptdir, "db/money-db.sqlite3")

''' define databse functions for opening/closing connections '''
# Get db connection
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(dbpath)
    return db

# Close db connection (done automaticly)
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

''' ************************************************************************ '''
'''                               PYTHON FUNCTIONS                           '''
''' ************************************************************************ '''

# returns a dictionary of the products: {id, name, description, price, quantity, img}
# for .fetchall
def map_assets_query_results(assets):
    return [{'id':asset[0], 'balance':asset[1], 'category':asset[2], 'date':asset[3]} for asset in assets]

def map_income_query_results(assets):
    return [{'id':asset[0], 'amount':asset[1], 'category':asset[2], 'date':asset[3], 'description':asset[4]} for asset in assets]

def map_budget_query_results(assets):
    return [{'amount':asset[0], 'category':asset[1], 'term':asset[2]} for asset in assets]

def map_category_query_results(assets):
    return [asset[0] for asset in assets]

''' ************************************************************************ '''
'''                               ROUTE HANDLERS                             '''
''' ************************************************************************ '''

''' page handlers '''
### HOME ###
# home page
@app.route("/", methods=["GET"])
def home():
    return render_template("home.html")




### TRANSACTIONS ###
# transactions page
@app.route("/transactions/", methods=["GET"])
def transactions():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rowsCat = c.execute("SELECT name FROM budget ORDER BY name DESC").fetchall()
    rowsCat = map_category_query_results(rowsCat)

    return render_template("transactions.html", categorys=rowsCat)




### INCOME ###
# income page
@app.route("/income/", methods=["GET"])
def income():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rows = c.execute("SELECT id, amount, category, date, description FROM income ORDER BY date(date) DESC;").fetchall()
    rows = map_income_query_results(rows)

    return render_template("income.html", rows=rows)

# POST
@app.route("/income-insert/", methods=["POST"])
def incomeInsert():
    # get post data
    amount = request.form["amount"]
    category = request.form["category"]
    date = request.form["date"]
    description = request.form["description"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # add new asset
    c.execute('''
        INSERT INTO income (amount, category, date, description) VALUES (?, ?, ?, ?)
    ''', (amount, category, date, description))
    conn.commit()

    # get id
    id = str(c.lastrowid)

    return id, 200

# POST
@app.route("/income-update/", methods=["POST"])
def incomeUpdate():
    # get post data
    amount = request.form["amount"]
    category = request.form["category"]
    date = request.form["date"]
    description = request.form["description"]
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()


    # Update the asset
    c.execute('''
    UPDATE income  set amount=?, category=?, date=?, description=? WHERE id=?
    ''', (amount, category, date, description, id))
    conn.commit()

    return "", 201

# POST
@app.route("/income-delete/", methods=["POST"])
def incomeDelete():
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM income WHERE id=?
    ''', (id,))
    conn.commit()

    return "", 201







### ASSETS ###
# assets page
# GET
@app.route("/assets/", methods=["GET"])
def assetsGet():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rows = c.execute("SELECT id, balance, category, date FROM assets ORDER BY date(date) DESC;").fetchall()
    rows = map_assets_query_results(rows)

    return render_template("assets.html", rows=rows)

# POST
@app.route("/assets-insert/", methods=["POST"])
def assetsInsert():
    # get post data
    balance = request.form["balance"]
    category = request.form["category"]
    date = request.form["date"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # add new asset
    c.execute('''
        INSERT INTO assets (balance, category, date) VALUES (?, ?, ?)
    ''', (balance, category, date))
    conn.commit()

    # get id
    id = str(c.lastrowid)

    return id, 200

# POST
@app.route("/assets-update/", methods=["POST"])
def assetsUpdate():
    # get post data
    balance = request.form["balance"]
    category = request.form["category"]
    date = request.form["date"]
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()


    # Update the asset
    c.execute('''
    UPDATE assets  set balance=?, category=?, date=? WHERE id=?
    ''', (balance, category, date, id))
    conn.commit()

    return "", 201

# POST
@app.route("/assets-delete/", methods=["POST"])
def assetsDelete():
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM assets WHERE id=?
    ''', (id,))
    conn.commit()

    return "", 201





### BUDGET ###
# Budget page
@app.route("/budget/", methods=["GET"])
def budget():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rowsm = c.execute("SELECT amount, name, term FROM budget WHERE term like '%month%' ORDER BY amount DESC;").fetchall()
    rowsm = map_budget_query_results(rowsm)

    rowsy = c.execute("SELECT amount, name, term FROM budget WHERE term like '%year%' ORDER BY amount DESC;").fetchall()
    rowsy = map_budget_query_results(rowsy)

    return render_template("budget.html", rowsm=rowsm, rowsy=rowsy)


# POST
@app.route("/budget-insert/", methods=["POST"])
def budgetInsert():
    # get post data
    amount = request.form["amount"]
    category = request.form["category"]
    type = request.form["type"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    try:
        # add new asset
        c.execute('''
            INSERT INTO budget (name, amount, term) VALUES (?, ?, ?)
            ''', (category, amount, type))
        conn.commit()

        # get id
        id = str(c.lastrowid)
        return id, 200
    except:
        print("ERROR: insert error occured")
        return "Bad insert", 200



# POST
@app.route("/budget-update/", methods=["POST"])
def budgetUpdate():
    # get post data
    amount = request.form["amount"]
    category = request.form["category"]
    type = request.form["type"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    print(amount, category, type)
    # Update the asset
    c.execute('''
    UPDATE budget set amount=? WHERE name=?
    ''', (amount, category))
    conn.commit()

    return "", 201

# POST
@app.route("/budget-delete/", methods=["POST"])
def budgetDelete():
    name = request.form["name"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM budget WHERE name=?
    ''', (name,))
    conn.commit()

    return "", 201





### TEST ###
# test page
@app.route("/test/")
def test():
    return render_template("test.html")



''' errors handlers '''
@app.errorhandler(400)
def page_not_found_400(e):
    print("ERROR 400:", e)
    return render_template("error.html", code=404, description="You Made A Bad Request"), 400

@app.errorhandler(401)
def page_not_found_401(e):
    print("ERROR 401:", e)
    return render_template("error.html", code=404, description="Unauthorized Access"), 401

@app.errorhandler(403)
def page_not_found_403(e):
    print("ERROR 403:", e)
    return render_template("error.html", code=404, description="Access Forbidden"), 403

@app.errorhandler(404)
def page_not_found_404(e):
    print("ERROR 404:", e)
    return render_template("error.html", code=404, description="Page Not Found"), 404

@app.errorhandler(500)
def page_not_found_500(e):
    print("ERROR 500:", e)
    return render_template("error.html", code=500, description="Internal Server Error"), 500



if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000)
    
#if __name__ == "__main__":
#    app.run(debug=True)

# Having debug=True allows possible Python errors to appear on the web page
# run with $> python server.py
