# Asset_Map
An interactive tree structure used to visualise subdomains. It is configured to work alongside AnScan by connecting to the MongoDB and using the UID.

# Installing 
A docker-compose file has been created or you can use the python venv with the following:

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python3 app.py

# How to Use in AnScan
Find the UID of the scan in AnScan:


<img src="AnScan_ID.png" alt="Alt text" title="AnScan UID">

Paste into the URL of the Asset Map:


<img src="Asset_Tree.png" alt="Alt text" title="Asset Tree">


