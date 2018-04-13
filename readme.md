# Email Newsletter Suite of Solutions

For this final project, I wanted to create a suite of solutions that an email newsletter startup could use going forward. I was fortunate enough to have access to a real database where I could try many different approaches. The final products I created are the following:
* Referral Network Analysis
	* This D3.js tool allows a user to search for individual and look at their referral network. It provides information such as direct referrals, indirect referrals (direct referrals who referred others) and a referral network depth. Using these features it allow provides a score that rewards deeper networks. 
* Referral Prediction
	* I attempted to predict whether a user would refer another user. Ultimately, I found that there is a direct correlation between readership of the first 10 emails and referral rate.
* Churn Prediction & Score
	* Using an ensemble model of Random Forest, Adaboost, Naive Bayes, and KNN, I produced a score of likelihood to churn based on user behavior.




## Packages & Tools Used
PostgreSQL
Python
* Pandas
* Numpy
* Matplotlib
* [SqlAlchemy](https://github.com/zzzeek/sqlalchemy)
* [SKLearn](https://github.com/scikit-learn/scikit-learn)
* [NetworkX](https://github.com/networkx/networkx)

## Sample Code

### SQL Querying

Goal: Pull user information, derive a reader's location based on readership and ultimately link it back upon itself connecting user behavior of the referrer with the referred.
Breaking down the Query:
* t = table that contains that groups user's readership and gets a count of 'region' as 'region_count'
* s = table that takes that subquery and assigns a row number as 'rn' for each email address by 'region_count'
* subquery = table that takes s and joins it with a new user information table
* output = table that combines information about an individual and links that individual to the person who referred them if there was a referrer


```
df_referrer_linkage = pd.read_sql_query('''With subquery AS
                    (SELECT id, email, referral_code, referrer_id, referral_count, region, countryname, region_count, CAST(created_at as DATE), sid 
                    
                        FROM pg.users
                    
                    JOIN 
                        
                        (SELECT emailaddress, region, countryname, region_count
                            FROM
                                (
                                SELECT DISTINCT emailaddress, region, countryname, region_count, 
                                    ROW_NUMBER() OVER (PARTITION BY emailaddress 
                                       ORDER BY region_count DESC) AS rn
                                
                                    FROM (
                                        SELECT DISTINCT emailaddress, region, countryname, count(region) as region_count 
                                        FROM campaignmonitor_dedicated.opens
                                        GROUP by emailaddress, region, countryname
                                    ) t
                                    
                                ) s
                        WHERE s.rn = 1
                        group by s.emailaddress, s.region, countryname, region_count
                        order by s.emailaddress) 
                        as user_statecountry on users.email = user_statecountry.emailaddress
                    )
                    SELECT DISTINCT q1.id, q1.email, q1.referral_code, q1.referral_count, q1.region, q1.countryname, q1.region_count, CAST(q1.created_at as DATE) as created_date,
                        q2.id as referrer_id, q2.email as referrer_email, q2.referral_count as referrer_referral_count, q2.region as referrer_region, 
                        q2.countryname as referrer_country, q2.region_count as referrer_regioncount, CAST(q2.created_at as DATE) as referrer_created_date, q1.sid

                    FROM subquery q1 
                    
                    RIGHT JOIN
                    
                    subquery q2 on q1.referrer_id = q2.id

''', cnx)
```

### Python 

Goal: Get readership of user's first x emails. 
Background: Newletter open behavior by date can be derived a SQL table. This is a problem, however, it is impossible to compare a user's first day. To compare users in this way, I need to adjust the data so that they are all comparable. The following code does the following:
1. Get the number of columns in the dataframe
2. Iterate through each series 
3. Declare 'val' as equal to the values that are not null
4. Declare 'nan' as equal to the number of columns minus 'val'
5. Concatentate the two lists as 'newrow'
6. Add 'newrow' into the copy of the original dataframe

```
l = df_pivot_last_emails_dropped_pivot.shape[1]
df4 = df_pivot_last_emails_dropped_pivot.copy()
for row, ser in df_pivot_last_emails_dropped_pivot.iterrows():
    val = ser[ser.notnull()]
    nans = np.full(l - len(val), np.nan)
    newrow = np.concatenate((val, nans))
    df4.iloc[row] = newrow
```



## Presentation & Video
Please take a look through the presentation file [here](https://github.com/stokvis4/projectKojak/blob/master/presentation/projectKojak.pdf) as well as the video of the D3.js animation [here](https://github.com/stokvis4/projectKojak/blob/master/presentation/ReferralNetDemo.mov)

## Privacy Notice
All references of the company that I used are removed and to protect their data, I have not included versions of the pickles I created.
