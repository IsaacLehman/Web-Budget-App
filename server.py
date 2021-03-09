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
from flask import request, session, flash, abort
from flask import redirect, url_for
from flask import make_response
from flask import g
import flask_monitoringdashboard as dashboard
from functools import wraps
from waitress import serve
from datetime import datetime
from datetime import timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import random
import sqlite3
import os

''' ************************************************************************ '''
'''                                APP SET UP                                '''
''' ************************************************************************ '''

''' set app, cache time, and session secret key '''
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 # no cache
app.config["SECRET_KEY"] = "mIRGnpOyF0foDDXfXdzbgA" # Secret Key for Sessions



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
'''                                DASHBOARD SET UP                          '''
''' ************************************************************************ '''
def getNumUsers():
	numUsers = 0
	try:
		# connect to database:
		db_dash_connection = sqlite3.connect(dbpath)
		
		# get number of users
		c = db_dash_connection.cursor()
		numUsers = c.execute("SELECT COUNT(*) FROM USER").fetchone()[0];
		# close connection
		db_dash_connection.close()
	except Exception as e:
		print(e)
	return numUsers
	
task_schedule = {'hours':1} # every hour

# graph to log number of users 
dashboard.add_graph("Number of Users", getNumUsers, "interval", **task_schedule)

dashboard.bind(app)

''' ************************************************************************ '''
'''                              LOGIN SET UP                                '''
''' ************************************************************************ '''
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash("You need to login first")
            return redirect(url_for('login'))

    return wrap


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

def getUser():
    try:
        return session["logged_in"]
    except Exception as e:
        return None

''' ************************************************************************ '''
'''                               ROUTE HANDLERS                             '''
''' ************************************************************************ '''

''' page handlers '''
#https://techmonger.github.io/10/flask-simple-authentication/
### LOGIN ###
# login page
@app.route("/login/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']

        if not (username and password):
            flash("Username or Password cannot be empty.")
            return redirect(url_for('login'))
        else:
            username = username.strip()
            password = password.strip()

        # Connect to the database
        conn = get_db()
        c = conn.cursor()

        user = c.execute("SELECT username, pass_hash FROM user WHERE username like ?;", (username,)).fetchone()

        if user and check_password_hash(user[1], password):
            session["logged_in"] = username
            return redirect(url_for("home"))
        else:
            flash("Invalid username or password.")

    return render_template("login.html")




### LOGOUT ###
@app.route("/logout/")
@login_required
def logout():
    session.pop("logged_in", None)
    flash("successfully logged out.")
    return redirect(url_for('login'))




### SIGN UP ###
# signup page
@app.route("/signup/", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']

        if not (username and password):
            flash("Username or Password cannot be empty")
            return redirect(url_for('signup'))
        else:
            username = username.strip()
            password = password.strip()

        # Returns salted pwd hash in format : method$salt$hashedvalue
        hashed_pwd = generate_password_hash(password, 'sha256')

        try:
            # Connect to the database
            conn = get_db()
            c = conn.cursor()

            # add new asset
            c.execute('''
                INSERT INTO user (username, pass_hash) VALUES (?, ?)
            ''', (username, hashed_pwd))
            conn.commit()
        except Exception as e:
            print(e)
            flash("Username {u} is not available.".format(u=username))
            return redirect(url_for('signup'))

        flash("User account has been created.")
        return redirect(url_for("login"))

    return render_template("signup.html")






### HOME ###
# home page
@app.route("/", methods=["GET"])
@login_required
def home():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    incomeSums = None
    incomeSum = None
    try:
        incomeSums = c.execute("SELECT sum(amount) as Total, category FROM income WHERE username LIKE ? GROUP BY category ORDER BY Total DESC;",(getUser(),)).fetchall()
        incomeSum = sum([float(val[0]) for val in incomeSums])
    except Exception as e:
        print("Home income",e)


    assetSums = None
    assetSum = None
    try:
        assetSums = c.execute("""
        SELECT assets.balance, assets.category, assets.date
        FROM assets
        INNER JOIN (
        	SELECT category, max(date) as MaxDate
        	FROM assets
            WHERE username LIKE ?
        	GROUP BY category
        ) assetsTemp on assets.category = assetsTemp.category and assets.date = assetsTemp.MaxDate
        WHERE username LIKE ?
        ORDER BY assets.balance DESC;
        """,(getUser(), getUser())).fetchall()
        assetSum = sum([float(val[0]) for val in assetSums])
    except Exception as e:
        print("Home asset", e)


    monthlySum = 0
    yearlySum = 0
    totalSum = 0
    monthlySumT = 0
    yearlySumT = 0
    totalSumT = 0
    try:
        budgetSum = c.execute("""
        SELECT SUM(amount) asTotal, term  FROM budget
        WHERE username LIKE ?
        GROUP BY term
        ORDER BY term DESC;
        """,(getUser(),)).fetchall()
        yearlySum = budgetSum[0][0]
        monthlySum = budgetSum[1][0]
        totalSum = yearlySum + 12*monthlySum
    except Exception as e:
        print("Home budget", e)
	
    try:
        budgetSum = c.execute("""
        SELECT SUM(transactions.amount) asTotal, budget.term  FROM transactions
		JOIN budget on transactions.category = budget.name
		WHERE transactions.username LIKE ?
		GROUP BY term
		ORDER BY term DESC;
        """,(getUser(),)).fetchall()
        yearlySumT = budgetSum[0][0]
        monthlySumT = budgetSum[1][0]
        totalSumT = yearlySumT + monthlySumT
    except Exception as e:
        print("Home budget Spend",e)


    return render_template("home.html", incomeSums=incomeSums, incomeSum=incomeSum, assetSums=assetSums, assetSum=assetSum, yearlySum=yearlySum, monthlySum=monthlySum, totalSum=totalSum, yearlySumT=yearlySumT, monthlySumT=monthlySumT, totalSumT=totalSumT)








### TRANSACTIONS ###
# transactions page
@app.route("/transactions/", methods=["GET"])
@login_required
def transactions():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rowsCat = c.execute("SELECT name FROM budget WHERE term LIKE 'month' AND username LIKE ? ORDER BY name DESC",(getUser(),)).fetchall()
    rowsCatM = map_category_query_results(rowsCat)

    rowsCat = c.execute("SELECT name FROM budget WHERE term LIKE 'year' AND username LIKE ? ORDER BY name DESC",(getUser(),)).fetchall()
    rowsCatY = map_category_query_results(rowsCat)

    # get values
    rowsData = c.execute("SELECT id, amount, category, date, description FROM transactions WHERE username LIKE ? ORDER BY date(date) DESC;",(getUser(),)).fetchall()
    rows = map_income_query_results(rowsData)

    return render_template("transactions.html", categorysM=rowsCatM, categorysY=rowsCatY, rows=rows)

# POST
@app.route("/transactions-insert/", methods=["POST"])
@login_required
def transactionsInsert():
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
        INSERT INTO transactions (amount, category, date, description, username) VALUES (?, ?, ?, ?, ?)
    ''', (amount, category, date, description, getUser()))
    conn.commit()

    # get id
    id = str(c.lastrowid)

    return id, 200

# POST
@app.route("/transactions-update/", methods=["POST"])
@login_required
def transactionsUpdate():
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
    UPDATE transactions  set amount=?, category=?, date=?, description=? WHERE id=? AND username = ?
    ''', (amount, category, date, description, id, getUser()))
    conn.commit()

    return "", 201

# POST
@app.route("/transactions-delete/", methods=["POST"])
@login_required
def transactionsDelete():
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM transactions WHERE id=? AND username = ?
    ''', (id, getUser()))
    conn.commit()

    return "", 201










### INCOME ###
# income page
@app.route("/income/", methods=["GET"])
@login_required
def income():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rows = c.execute("SELECT id, amount, category, date, description FROM income WHERE username LIKE ? ORDER BY date(date) DESC;",(getUser(),)).fetchall()
    rows = map_income_query_results(rows)

    return render_template("income.html", rows=rows)

# POST
@app.route("/income-insert/", methods=["POST"])
@login_required
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
        INSERT INTO income (amount, category, date, description, username ) VALUES (?, ?, ?, ?, ?)
    ''', (amount, category, date, description, getUser()))
    conn.commit()

    # get id
    id = str(c.lastrowid)

    return id, 200

# POST
@app.route("/income-update/", methods=["POST"])
@login_required
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
    UPDATE income  set amount=?, category=?, date=?, description=? WHERE id=? AND username LIKE ?
    ''', (amount, category, date, description, id, getUser()))
    conn.commit()

    return "", 201

# POST
@app.route("/income-delete/", methods=["POST"])
@login_required
def incomeDelete():
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM income WHERE id=? AND username LIKE ?
    ''', (id,getUser()))
    conn.commit()

    return "", 201







### ASSETS ###
# assets page
# GET
@app.route("/assets/", methods=["GET"])
@login_required
def assetsGet():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rows = c.execute("SELECT id, balance, category, date FROM assets WHERE username LIKE ? ORDER BY date(date) DESC;",(getUser(),)).fetchall()
    rows = map_assets_query_results(rows)

    return render_template("assets.html", rows=rows)

# POST
@app.route("/assets-insert/", methods=["POST"])
@login_required
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
        INSERT INTO assets (balance, category, date, username) VALUES (?, ?, ?, ?)
    ''', (balance, category, date, getUser()))
    conn.commit()

    # get id
    id = str(c.lastrowid)

    return id, 200

# POST
@app.route("/assets-update/", methods=["POST"])
@login_required
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
    UPDATE assets  set balance=?, category=?, date=? WHERE id=? AND username LIKE ?
    ''', (balance, category, date, id, getUser()))
    conn.commit()

    return "", 201

# POST
@app.route("/assets-delete/", methods=["POST"])
@login_required
def assetsDelete():
    id = request.form["id"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM assets WHERE id=? AND username LIKE ?
    ''', (id, getUser()))
    conn.commit()

    return "", 201





### BUDGET ###
# Budget page
@app.route("/budget/", methods=["GET"])
@login_required
def budget():
    #Connect to the database
    conn = get_db()
    c = conn.cursor()

    # get values
    rowsm = c.execute("SELECT amount, name, term FROM budget WHERE term like '%month%' AND username LIKE ? ORDER BY amount DESC;",(getUser(),)).fetchall()
    rowsm = map_budget_query_results(rowsm)

    rowsy = c.execute("SELECT amount, name, term FROM budget WHERE term like '%year%' AND username LIKE ? ORDER BY amount DESC;",(getUser(),)).fetchall()
    rowsy = map_budget_query_results(rowsy)

    return render_template("budget.html", rowsm=rowsm, rowsy=rowsy)


# POST
@app.route("/budget-insert/", methods=["POST"])
@login_required
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
            INSERT INTO budget (name, amount, term, username) VALUES (?, ?, ?, ?)
            ''', (category, amount, type, getUser()))
        conn.commit()

        # get id
        id = str(c.lastrowid)
        return id, 200
    except:
        print("ERROR: insert error occured")
        return "Bad insert", 200



# POST
@app.route("/budget-update/", methods=["POST"])
@login_required
def budgetUpdate():
    # get post data
    amount = request.form["amount"]
    category = request.form["category"]
    type = request.form["type"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Update the asset
    c.execute('''
    UPDATE budget set amount=? WHERE name=? AND username LIKE ?
    ''', (amount, category, getUser()))
    conn.commit()

    return "", 201

# POST
@app.route("/budget-delete/", methods=["POST"])
@login_required
def budgetDelete():
    name = request.form["name"]

    # Connect to the database
    conn = get_db()
    c = conn.cursor()

    # Delete the asset
    c.execute('''
    DELETE FROM budget WHERE name=? AND username LIKE ?
    ''', (name, getUser()))
    conn.commit()

    return "", 201





### TEST ###
# test page
@app.route("/test/")
@login_required
def test():
    return render_template("test.html")



''' errors handlers '''
@app.errorhandler(400)
@login_required
def page_not_found_400(e):
    print("ERROR 400:", e)
    return render_template("error.html", code=404, description="You Made A Bad Request"), 400

@app.errorhandler(401)
@login_required
def page_not_found_401(e):
    print("ERROR 401:", e)
    return render_template("error.html", code=404, description="Unauthorized Access"), 401

@app.errorhandler(403)
@login_required
def page_not_found_403(e):
    print("ERROR 403:", e)
    return render_template("error.html", code=404, description="Access Forbidden"), 403

@app.errorhandler(404)
@login_required
def page_not_found_404(e):
    print("ERROR 404:", e)
    return render_template("error.html", code=404, description="Page Not Found"), 404

@app.errorhandler(500)
@login_required
def page_not_found_500(e):
    print("ERROR 500:", e)
    return render_template("error.html", code=500, description="Internal Server Error"), 500


if __name__ == "__main__":
    #app.run(debug=True)
    #app.run(threaded=True, host='0.0.0.0', port=12345)
	serve(app, host='0.0.0.0', port=8080, threads=20) #WAITRESS!

# Having debug=True allows possible Python errors to appear on the web page
# run with $> python server.py
