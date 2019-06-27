#YelpCamp

* Add Landing Page
* Add Campgrounds Page that lists all campgrounds

Each campground has:
* Name
* Image





#Layout and Basic Styling
* Create our header and footer partials
* Add in Bootstrap





#Creating New Campgrounds
* Setup new campground POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form





#Style the Campgrounds page
* Add a better header/title
* Make campgrounds display in a grid






#Style the navBar and Form
* Add a navBar to all template
* Style the new campground form






#Add Mongoose <-----v2----->
* Install and configure Mongoose
* Use campground model inside of our routes






#Show page
* Review the RESTful routes we've seen so farm
* Add description to our campground model
* Show db.collection().drop()
* Add a show route/template

RESTFUL ROUTE

name             url               verb                description
INDEX            /dogs             GET                 display a list of dogs
New             /dogs/new          GET                 display form to make a new dog
Create           /dogs             POST                Add new dog to db
Show            /dogs:id           GET                 Shows info about one dog





#Refactor Mongoose Code(<--------v3----------->)
* Create a models directory
* Use module.exports
* Require everything correctly






#Add Seeds File
* Add a seeds.js File
* Run the seeds file everytime the server starts






#Add the Comment Model!
* Make our errors go away
* Display comments on campground show page







#Comment New/create<------v4------>
* Discuss nested routes
* Add the comment new and create routes
* Add the new comment Form






#Style the Comments page<--------v5----------->
* Add sidebar to the show Page
* Display comments nicely







#Add User model<--------v6----------->
* Install all packages needed for authentication
* Define User Model







#Editing campgrounds<-----v9------>
* edit Campgrounds
* delete campgrounds








#Authorization for edit and delete<-------v10------->
* User can only edit his/her own campgrounds
* User can only delete his/her own campgrounds
* Hide/Show edit and delete buttons







# Editing comments
* add edit route
* add a button  
* update route
/campgrounds/:id/edit
/campgrounds/:id/comments/:comment_id/edit

# deleting Comments:
* add destroy route
* destroy button

#Authorization for comment edit and delete
* User can only edit his/her own comment
* User can only delete his/her own comment
* Hide/Show edit and delete buttons
* refactor middleware






# Adding in flash
