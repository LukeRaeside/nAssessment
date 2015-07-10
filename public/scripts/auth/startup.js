var pending_forms;
var submitted_forms;
var task_nos=[];
var counts;
var sno;
var leng;



$(document).ready(function() {

	$(document).on('click','.create_form',function(){
		
		$(".result").empty();
		sno=0;
		task_nos.push(1);
		
		$(".result").html("<table width='100%'>"+
					"<tr><td align='right'>Select Course: &nbsp;</td><td align='left'>"+
					"<select id='mycourse_form'><option>---Select---</option></select></td></tr>"+
					"</table><br><table id='newform' width='100%'></table><br><table id='tasks_tab'></table><table id='save-btn'></table>");
		//$("#mycourse").html("<option>---Select---</option>");
		Util.ajaxGet("courses/igive", function(result) {
			//alert(JSON.stringify(result))
			$("#mycourse_form").append("")
			for(i=0;i<result.Courses.length;i++)
			{
				$("#mycourse_form").append("<option value='"+result.Courses[i]._id+"'>"+
						result.Courses[i].Name+"</option>")
			}
		});
	});
	$(document).on('change','#mycourse_form',function(){
		$("#newform").html("");
		$("#save-btn").html("");
		$("#newform").append("<tr><td>Form Name:&nbsp;</td><td><input type='text' id='form_name'></td>"+
				"<td id='form_name_con'></td></tr>"+
				"<tr><td>Enter Number of Tasks:</td><td><input type='text' id='numtask'/></td></tr>"+
				
				"<tr><td>Total Max Marks:</td><td id='totalmarks1'></td></tr>");
		$("#save-btn").append("<tr><td><input type='button' id='save' value='save'></td></tr>")
	});
	$(document).on('change','#numtask',function(){
		leng = 0;
		//alert(leng)
		sno=0;
		var num=$("#numtask").val();
		$("#tasks_tab").empty();
		$("#tasks_tab").append("<tr><th align='left'>Number</th><th align='left'>Task</th><th align='left'>Max Marks</th><th></th></tr>")
		for(i=0;i<num;i++){
			
		    leng++;
		    task_nos.push(""+leng);
		    sno=sno+1;
		    if(i == num-1){
		    	$("#tasks_tab").append('<tr id="'+leng+'"><td> <span id="task_number'+leng+'">'+sno+'</span></td>'+
			    		'<td> <input type="text" value="" id="task'+leng+'" placeholder="Enter Task"/> </td>'+
			    		'<td>  <input type="text" value="" id="marks'+leng+'" placeholder="Enter Marks"/ onchange=totalmarksone('+
			    		num+',"marks","totalmarks1")></td>'+
			    		'<td id="tasks_con_'+leng+'"></td>'+
			    		'<td><a id="del_row" r_id="'+leng+'" style="cursor: pointer;">del</a></td></tr>');
		    }
		    else{
		    	$("#tasks_tab").append('<tr id="'+leng+'"><td> <span id="task_number'+leng+'">'+sno+'</span></td>'+
			    		'<td> <input type="text" value="" id="task'+leng+'" placeholder="Enter Task"/> </td>'+
			    		'<td>  <input type="text" value="" id="marks'+leng+'" placeholder="Enter Marks"/></td>'+
			    		'<td id="tasks_con_'+leng+'"></td>'+
			    		'<td><a id="del_row" r_id="'+leng+'" style="cursor: pointer;">del</a></td></tr>');
		    }
		    
		}
		
		
	
	})
	$(document).on('click','#add',function(){
		var table = $(this).closest('table');
	    leng++;
	    task_nos.push(""+leng);
	    sno=sno+1;
	    table.append('<tr id="'+leng+'"><td> <span id="task_number'+leng+'">'+sno+'</span></td>'+
	    		'<td> <input type="text" value="" id="task'+leng+'" placeholder="Enter Task"/> </td>'+
	    		'<td>  <input type="text" value="" id="marks'+leng+'" placeholder="Enter Marks"/></td>'+
	    		'<td id="tasks_con_'+leng+'"></td>'+
	    		'<td><a id="del_row" r_id="'+leng+'" style="cursor: pointer;">del</a></td></tr>');
	});
	$(document).on('click','#del_row',function () {
	    var table = $(this).closest('table');
		var r_id=$(this).attr("r_id")
		//alert(r_id)
		var taskNo=parseInt($("#task_number"+r_id).html());
		//alert(task_nos+"====="+r_id)
		var index = task_nos.indexOf(""+r_id);
		if (index > -1) {
			task_nos.splice(index, 1);
		}
		for(i=index;i<task_nos.length;i++)
		{
			var t=parseInt($("#task_number"+task_nos[i]).html())
			$("#task_number"+task_nos[i]).html(t-1)
		}
		$("#"+r_id).remove();
		
		//leng--;
		sno--;
	});
	$(document).on('click','#save',function(){
		var task=[];
		
		task_sno=1;
		var form_name=$("#form_name").val();
		var course_id=$("#mycourse_form").val();
		form_name=form_name.trim();
		if(form_name=="")
		{
			alert("Please Enter the form name.");
			task=[];
			return;
		}
		if(course_id=="")
		{
			alert("Please Select the course.");
			task=[];
			return;
		}
		for(i=1;i<=sno;i++)
		{
			//alert("sno "+sno);
			var taskname=$('#task'+i).val();
			var marks=$('#marks'+i).val();
			taskname=taskname.trim();
			marks=marks.trim();
			//alert(taskname)
			//alert(marks)
			if(taskname=="" && marks=="")
			{
				continue;
			}
			else if(taskname!="" && marks=="")
			{
				$("#tasks_con_"+i).empty();
				$("#tasks_con_"+i).append("&nbsp;Please Enter marks for task "+i+"&nbsp;");
				task=[];
				return;
			}
			else if(taskname=="" && marks!="")
				{
				$("#tasks_con_"+i).empty();
				$("#tasks_con_"+i).append("&nbsp;Please Enter task field for task "+i+"&nbsp;");
				task=[];
				return;
			}
			else if(taskname!="" && marks!="")
			{
				if(isNaN(marks))
				{
					$("#tasks_con_"+i).empty();
					$("#tasks_con_"+i).append("&nbsp; Please Enter only numbers in marks &nbsp;")
					task=[];
					return;
				}
				task.push({"Number":task_sno,"Name":taskname,"MaxMarks":marks})
				task_sno++;
			}
		
				
		}
		//alert(JSON.stringify(task))
		if(task.length>=1)
		{
			var crse = {
					FormName: form_name,
					CourseId: course_id,
					Tasks: task
				};
			Util.ajaxPost("courseforms/save", { criteria: { courseForm: crse } }, function(result) {
				if (result.Status) {
					$("#save-btn").html("")
					$("#newform").html("")
					$("#tasks_tab").html("")
					$("#newform").append("Assessment Form is created successfully.")
					//alert("done")
				
				}
			});
		}
		else{
			alert("Please enter atlist 1 task to save.")
		}
		
		
	});
	$(document).on('change','#mycourse',function(){
		displayForms();
		//course=$(this).val();
		//alert(course)
		/*$("#forms").html("");
		if ($("#radio1").is(":checked")) {
			search_by_course("submitted")
		}
		else if ($("#radio2").is(":checked")) {
			search_by_course("pending")
		}
		else{
			
		}*/
	});
	$(document).on('click','#SendForm',function(){
	
		var fid=$(this).attr('fid');
		
		Util.ajaxPost('courseforms/send/'+fid, function(result) {
			
			//alert(JSON.stringify(result))
		})
	});
	$(document).on('change','input[type=radio][name=course]',function(){
		course_type=$(this).val();
		
		if(course_type=="itake")
		{
			$("#mycourse").html("<option>---Select---</option>");
			Util.ajaxGet("courses/itake", function(result) {
				$("#mycourse").append("")
				for(i=0;i<result.Courses.length;i++)
				{
					$("#mycourse").append("<option value='"+result.Courses[i]._id+"'>"+
							result.Courses[i].Name+"</option>")
				}
			});
		}
		else if(course_type=="igive")
		{
			$("#mycourse").html("");
			Util.ajaxGet("courses/igive", function(result) {
				$("#mycourse").append("<option>---Select---</option>")
				for(i=0;i<result.Courses.length;i++)
				{
					$("#mycourse").append("<option value='"+result.Courses[i]._id+"'>"+result.Courses[i].Name+"</option>")
				}
				
			});
		}
	 });
	
	$("#logout").click(function(e) {
		e.stopPropagation();
		Util.ajaxPost("users/logout", {}, function(result) {
			window.location.reload();
		});
	});
	
	$(".userlist").on('click', function(e) {
		
		e.stopPropagation();
		Util.ajaxGet("users", function(result) {
			$(".result").empty();
			$(".result").append("<table id='usertable' style='width:100%'><tr><th>FirstName</th>"+
					"<th>LastName</th><th>Name</th></tr></table");
			for(i=0;i<result.data.length;i++){
				$("#usertable").append("<tr><td>"+result.data[i].FirstName+"</td>"+
						"<td>"+result.data[i].LastName+"</td>"+
						"<td>"+result.data[i].Name+"</td></tr>");
			}
		});
	});

	/*$(".useradd").on('click', function(e) {
		e.stopPropagation();
		debugger;
		var user = {
			FirstName:"Manasa",
			LastName:"Mattupalli",
			Name:"manasa",
			Password:"a"
		};
		var crit = { user: user };
		Util.ajaxPost("users/add", { criteria: crit }, function(result) {
			for(i=0;i<result.lenght;i++){
			$(".result").html(JSON.stringify(result));
			}
		});
	});*/
	

	$(".userupdate").on('click', function(e) {
		e.stopPropagation();
		var user = {
			Email: "sridevi@grandvinsoft.com"
		};
		var crit = { user: user };
		Util.ajaxPost("users/save/54b8013c19ce702c0c06782e", { criteria: crit }, function(result) {
			$(".result").html(JSON.stringify(result));
		});
	});
	


	$(".coursetake").on('click', function(e) {
		e.stopPropagation();
		Util.ajaxGet("courses/itake", function(result) {
			$(".result").html(JSON.stringify(result));
		});
	});		

	$(document).on('click','.search_by_course',function(){
		
		$(".result").html("<table width='80%'>"+
		"<tr><td>IGive<input type='radio' id='radio1' name='course' value='igive' id='course'></td>"+
		"<td>ITake<input type='radio' id='radio2' name='course' id='course' value='itake'></td>"+
		"<td><select id='mycourse'><option>---Select---</option></select></td><tr>"+		
		"</table><br><table id='forms' width='80%'><tr><th>CourseName</th>"+
		"<th>FormName</th><th id='SendForm' fid='54d1b230ab4cf49c0e75e877'>Send</th></tr></table>");
		
		/*Util.ajaxGet("courseforms/pending", function(result) {
			pending_forms=result;
			for(i=0;i<pending_forms.PendingForms.length;i++)
			{
					$("#forms").append("<tr><td>"+pending_forms.PendingForms[i].CourseName+"</td><td><a href='' fid='"+pending_forms.PendingForms[i].CourseFormId+"'>"+pending_forms.PendingForms[i].FormName+"</a></td></tr>");
			}
			
		});
		Util.ajaxGet("courseforms/submitted", function(result) {
			submitted_forms=result;
			for(i=0;i<submitted_forms.SubmittedForms.length;i++)
			{
					$("#forms").append("<tr><td>"+submitted_forms.SubmittedForms[i].CourseName+"</td><td><a href='' fid='"+submitted_forms.SubmittedForms[i].CourseFormId+"' >"+submitted_forms.SubmittedForms[i].FormName+"</a></td><td><a href='' fid='"+submitted_forms.SubmittedForms[i].CourseFormId+"' id='SendForm' >Send</a></td></tr>");
			}
		});*/
		//search_by_course();
	});
	
	 
	$(".courselist").on('click', function(e) {
		//alert("hello in courselist")
		e.stopPropagation();
		
		Util.ajaxGet("courses/igive", function(result) {
			//alert(JSON.stringify(result));
			$(".result").html(JSON.stringify(result));
		});
	});
	
	Util.ajaxGet("users/current", function(result) {
		if (result.Status) {
			Shell.CurrentUser = result.User;
			prepareMenu(Shell.CurrentUser);
		}
	});

});



function loginUser() {
	
	
		var crit = {
			"criteria": {"userName":$("#username").val(), "password":$("#password").val()}
		};
		Util.ajaxPost("users/login", crit,
			function(result) {
				if (result.Status === true) { window.location.reload(); }
				else {
					alert("Not Authenticated");
				}
			}
		);	
	}
/*
 * Prepares the left navigation menu under Courses and Assessment Forms based oon the
 * user's attributes (IsFaculty, IsStudent)
 * 
 * 
 */

function prepareMenu(user) {
	
	
	if(user.IsFaculty == true && user.IsStudent == true){
		
		 $(".result").append("<button class='btn btn-link' onclick=addCourse()>Add course</button>")
				displaycourselist();
				

		submittedforms();

		studentdisplaycourselist();
		formspending();
		$("#home").click(function(){
			$(".result").empty();
			 $(".result").append("<button class='btn btn-link' onclick=addCourse()>Add course</button>")
			displaycourselist();
			
			submittedforms();
			studentdisplaycourselist();
			formspending();
			
			
		});
		
		
		$("#assesstable").append("<tr class='assesslist'>"+
				"<td><button class='action search_by_course assesslist btn btn-link'>Search By Course</button></td></tr>"+
		"<tr class='assesslist'><td><button class='action create_form assesslist btn btn-link' onclick='createForm()'>Create Form</button>" +
		"</td></tr>")
	}
	else if(user.IsFaculty == true){
		
		 $(".result").append("<button class='btn btn-link' onclick=addCourse()>Add course</button>")
				displaycourselist();

				submittedforms()
				$("#home").click(function(){
			$(".result").empty();
			 $(".result").append("<button class='btn btn-link' onclick=addCourse()>Add course</button>")
			displaycourselist();
			submittedforms()
			
			

		});
		
				$("#assesstable").append("<tr class='assesslist'><td><button "+
						"class='action search_by_course assesslist btn btn-link'>Search By Course</button></td></tr>"+
				"<tr class='assesslist'><td><button class='action create_form assesslist btn btn-link'>Create Form</button></td></tr>")		
	}
	else if(user.IsStudent == true){
		
				studentdisplaycourselist();
				formspending();
				
				$("#home").click(function(){
					$(".result").empty();
					studentdisplaycourselist();
					formspending();
					
					
				});
				
		/*$("#assesstable").append("<tr class='assesslist'><td><button class='action  assesslist btn btn-link'>Search By Course</button></td></tr>"+
						"<tr class='assesslist'><td><button class='action  assesslist btn btn-link'>Pending forms</button></td></tr>"+
						"<tr class='assesslist'><td><button class='action  assesslist btn btn-link'>Submitted forms</button></td></tr>"+
						"<tr class='assesslist'><td><button class='action  assesslist btn btn-link'>Finalized</button></td></tr>");	*/	
	
	}
	else{}
	$(".courselister").hide();
	$(".assesslist").hide();
		
	}

	
function displaycourselist(){
	
	
	Util.ajaxGet("courses/igive", function(result)  {
		
		
		//alert(JSON.stringify(result));
		if(result.Courses.length>0){
			$(".result").append("<br><h1>Courses Given</h1>")
			$(".result").append("The following are the courses given by you")
			$(".result").append("<table id='courselis'></table")
			for(i=0;i<result.Courses.length;i++){
				//alert(JSON.stringify(result));
				
				
				//alert(result.Courses[i]._id)
					$("#courselis").append(""+
							"<tr><td>"+result.Courses[i].Name+"</td>"+
							"<td><button class='btn btn-link' id='addstudent' "+
							"onclick=addstudent('"+result.Courses[i]._id+"')>Add Student</button></td></tr>");
								}
					}
			});
	
}
function studentdisplaycourselist(){
	
	Util.ajaxGet("courses/itake", function(result) {
		//alert(JSON.stringify(result));
		$(".result").append("<br><h1>Courses Taken</h1>")
		$(".result").append("The following are the courses taken by you");
		for(i=0;i<result.Courses.length;i++){
			$(".result").append(""+
				"<table><tr><td>"+result.Courses[i].Name+"</td>"+
				"<td><button type='link' class='btn btn-link' "+
				"onclick=viewScores('"+result.Courses[i]._id+"')>View Scores</button></td></tr></table>");
		}
		
		
		
	});

}

function formspending(){

Util.ajaxGet("courseforms/pending", function(result) {
	//alert(JSON.stringify(result));
	$(".result").append("<br><h1>Pending Forms</h1>");
	$(".result").append("the following forms are pending for self assessment")
	$(".result").append("<table></table>");
	for(i=0;i<result.PendingForms.length;i++){
		//alert(new Date(result.PendingForms[i].DueDate));
		
		$(".result").append("<tr><td>"+result.PendingForms[i].CourseName+"&nbsp;&nbsp-&nbsp;&nbsp;</td>"+
				"<td>"+result.PendingForms[i].FormName+"</td>"+
				"<td><button class='btn btn-link' onclick=selfAssess('"+result.PendingForms[i].CourseFormId+"','"+result.PendingForms[i].StudentId+"','"+result.PendingForms[i].CourseId+"')>"+
				"SelfAssess</button></td></tr>");
		
		}
	});
	
}
function submittedforms(){
	
	Util.ajaxGet("courseforms/submitted", function(result) {
		//alert(JSON.stringify(result));
		$(".result").append("<br><h1>Submitted Forms</h1")
		$(".result").append("<table id='submittable' style='width:100%'></table>")
		$("#submittable").append("<tr><th>Student name</th>"+
				"<th>Course Name</th>"+
				"<th>Submitted On</th></tr>")
			//	alert()
		if(result.Status){
			for(i=0;i<result.SubmittedForms.length;i++){
				var dated=result.SubmittedForms[i].SubmittedOn
				var date = new Date(dated);
				var submittedOn=(date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
			$("#submittable").append("<tr><td><button class='btn btn-link' onclick=studentInfo('"+result.SubmittedForms[i].StudentId+"')>"+result.SubmittedForms[i].StudentName+"</button></td>"+
					"<td><button class='btn btn-link' onclick=courseInfo('"+result.SubmittedForms[i].CourseId+"')>"+
					result.SubmittedForms[i].CourseName+"</button></td>"+
					"<td>"+submittedOn+"</td>" +
							"<td><button class='btn btn-link' onclick=view('"+result.SubmittedForms[i].StudentId+"','"+
							result.SubmittedForms[i].CourseId+"','"+result.SubmittedForms[i].CourseFormId+"')>View</button></td>" +
							"<td><button class='btn btn-link' onclick=assess('"+result.SubmittedForms[i].StudentId+"','"+
							result.SubmittedForms[i].CourseId+"','"+result.SubmittedForms[i].CourseFormId+"')>Assess</button></td></tr>")
			
			}
		}
		
		//$(".result").append(JSON.stringify(result));
	});
	
}


function search_by_course(type)
{
	
	if(type=="submitted")
	{
		$("#forms").append("<tr><th>CourseName</th><th>FormName</th><th>Send</th></tr>");
		for(i=0;i<submitted_forms.SubmittedForms.length;i++)
		{
			//alert(course+", "+submitted_forms.SubmittedForms[i].CourseName)
			if(course==submitted_forms.SubmittedForms[i].CourseName)
			{
				$("#forms").append("<tr><td>"+submitted_forms.SubmittedForms[i].CourseName+"</td>"+
						"<td><a href='' fid='"+submitted_forms.SubmittedForms[i].CourseFormId+"'>View Form</a>"+
						"</td><td><a href='' fid='"+submitted_forms.SubmittedForms[i].CourseFormId+"' id='SendForm' >"+
						"Send</a></td></tr>");
			}
		}
	}
	else if(type=="pending"){
		$("#forms").append("<tr><th>Course Name</th><th>Form</th></tr>");
		for(i=0;i<pending_forms.PendingForms.length;i++)
		{
			//alert(course+", "+pending_forms.PendingForms[i].CourseName)
			if(course==pending_forms.PendingForms[i].CourseName)
			{
				$("#forms").append("<tr><td>"+pending_forms.PendingForms[i].CourseName+"</td>"+
						"<td><a href='' fid='"+pending_forms.PendingForms[i].CourseFormId+"'>View Form</a></td></tr>");
			}
		}
	}
	else{
		//alert("all"+submitted_forms.SubmittedForms.length)
		$("#forms").append("<tr><th>CourseName</th><th>FormName</th><th>Send</th></tr>");
		for(i=0;i<submitted_forms.SubmittedForms.length;i++)
		{

			
			if(course==submitted_forms.SubmittedForms[i].CourseName)
			{
				$("#forms").append("<tr><td>"+submitted_forms.SubmittedForms[i].CourseName+"</td>"+
						"<td><a href='' fid='"+submitted_forms.SubmittedForms[i].CourseFormId+"'>View Form</a>"+
						"</td><td><a href='' fid='"+submitted_forms.SubmittedForms[i].CourseFormId+"' "+
						"id='SendForm' >Send</a></td></tr>");
			}
		}
		for(i=0;i<pending_forms.PendingForms.length;i++)
		{
			if(course==pending_forms.PendingForms[i].CourseName)
			{
				$("#forms").append("<tr><td>"+pending_forms.PendingForms[i].CourseName+"</td>"+
						"<td><a href='' fid='"+pending_forms.PendingForms[i].CourseFormId+"'>View Form</a>" +
								"</td></tr>");
			}
		}
	}
}

function offeredcourselist(){
	$(".result").empty();
	displaycourselist()
}
function addstudent(id){
	//alert("in add student");
	var user=[];
	var updateduser=[];
	counts=0;
	count=0;
	Util.ajaxGet('courses/'+id+'/students', function(result) {
		
		if (result.Status) {
			//alert(JSON.stringify(result));
			$(".result").empty();
			$(".result").append("<h1>Students in the Course</h1>")
			$(".result").append("<table id='presentuserstable' style='width:100%'></table>")
				for(i=0;i<result.Students.length;i++){
					
					counts=i+1;
					user[i]=result.Students[i]._id;
					$("#presentuserstable").append("<tr><td>"+counts+"</td>"+
							"<td>"+result.Students[i].Email+"</td>"+
							"<td>"+result.Students[i].FirstName+"</td>"+
							"<td>"+result.Students[i].LastName+"</td>"+
						"</tr>");
									}
			
					//alert("done");
					} 
		else {
		//renderErrorMessage($(".users-res"), result);
		}
		//(user)
		/*$(".result;").append("<br><br><input id='userid' type='text' class='form-control'>"+
				"<button class='btn btn-info' onclick=setstudent()>set student</button>");*/
	
		
	
	
	});
	Util.ajaxGet('users', function(result) {
		//alert(JSON.stringify(result))
		$(".result").append("<h1>Users</h1>")
		$(".result").append("<table id='userstable' style='width:110%'></table>")
			if (result.Status) {
				for(i=0;i<result.Users.length;i++){
					
					for(s=0;s<user.length;s++){
						//alert(user[s]);
						if(user[s]==result.Users[i]._id){
							i++;
							//var index=result.Users[i]._id.indexOf(userupdatedid);
						}
					}
					if(result.Users[i].IsStudent == true ){
						count=i+1;
						$("#userstable").append("<tr id='user_"+result.Users[i]._id+"'><td>"+count+" </td>" +
								"<td ><span id='email_"+result.Users[i]._id+"' style='margin-left: 18px;'>"+result.Users[i].Email+"</span> </td>"+
								"<td ><span id='fname_"+result.Users[i]._id+"'>"+result.Users[i].FirstName+"</span> </td>"+
								"<td ><span id='lname_"+result.Users[i]._id+"'>"+result.Users[i].LastName+"</span> </td>"+
								"<td>"+result.Users[i].Name+" </td>" +
								"<td> Student </td>"+
								
								"<td><button class='btn btn-warning btn-xs' onclick=addindividualstudents('"+id+"','"+result.Users[i]._id+"')>Add</button> </td></tr>")	
								}
					/*if(result.Users[i].IsFaculty == true){
						$("#userstable").append("<tr id='user_"+result.Users[i]._id+"'><td>"+count+" </td>" +
								"<td ><span id='email_"+result.Users[i]._id+"' style='margin-left: 18px;'>"+result.Users[i].Email+"</span> </td>"+
								"<td ><span id='fname_"+result.Users[i]._id+"'>"+result.Users[i].FirstName+"</span> </td>"+
								"<td ><span id='lname_"+result.Users[i]._id+"'>"+result.Users[i].LastName+"</span> </td>"+
								"<td>"+result.Users[i].Name+" </td>" +
								"<td> Lecturer </td>"+
								
								"<td><button class='btn btn-warning btn-xs' onclick=addindividualstudents('"+id+"','"+result.Users[i]._id+"')>Add</button> </td></tr>")	
					
					}
					if(result.Users[i].IsStudent == true && result.Users[i].IsFaculty == true){
						
						$("#userstable").append("<tr id='user_"+result.Users[i]._id+"'><td>"+count+" </td>" +
								"<td ><span id='email_"+result.Users[i]._id+"' style='margin-left: 18px;'>"+result.Users[i].Email+"</span> </td>"+
								"<td ><span id='fname_"+result.Users[i]._id+"'>"+result.Users[i].FirstName+"</span> </td>"+
								"<td ><span id='lname_"+result.Users[i]._id+"'>"+result.Users[i].LastName+"</span> </td>"+
								"<td>"+result.Users[i].Name+" </td>" +
								"<td> Lecturer and Student </td>"+
								
								"<td><button class='btn btn-warning btn-xs' onclick=addindividualstudents('"+id+"','"+result.Users[i]._id+"')>Add</button> </td></tr>")	
					
						
					}*/
						
						
					}
					
			}
				//alert(JSON.stringify(result));
			else{
				alert("not done");
			}	
		
		});

	
	}
function setstudent(){
	//alert("in set student")
	
		var userId = $("#userid").val();
	//alert(userId);
		var api = 'users/save/isstudent/'+userId+'/1';
		Util.ajaxPost(api,{}, function(result) {
		
			if (result.Status) {
				//$(".users-res").html("Done");
				alert("done");
		} else {
			renderErrorMessage($(".users-res"), result);
			}
		});
		
		
}
function addindividualstudents(courseid,studentid){
	//alert(courseid);
	
	var api = 'users/registercourse/'+courseid+'/'+studentid;
	var email = $("#email_"+studentid).text();
	//var email1=email.innerHTML;
	//alert(email);
	var fname = $("#fname_"+studentid).text();
	//alert(fname)
	var lname = $("#lname_"+studentid).text();
	//alert(lname);
	Util.ajaxPost(api, {}, function(result) {
		//renderAPIInfo($(".users-btns"), "POST", api);
		
			if (result.Status) {
				//alert("Done");
				$("#user_"+studentid).remove();
				counts=counts+1;
				$("#presentuserstable").append("<tr><td>"+counts+"</td>" +
						"<td>"+email+"</td>" +
								"<td>"+fname+"</td>" +
										"<td>"+lname+"</td></tr>");
			} else {
				//renderErrorMessage($(".users-res"), result);
				alert("not done");
			}
		});
	
	
}

function courseInfo(courseId){
	//alert(courseId);
	Util.ajaxGet('courses/get/'+courseId, function(result) {
		if(result.Status){
			$("#info").empty();
			//for(i=0;i<result.Courses.length;i++){
			var dated=result.Courses[0].StartDate;
			var date = new Date(dated);
			var startDate=(date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
				$("#info").append("<table style='width:100%'><tr><td>ID:</td><td>"+result.Courses[0]._id+"</td></tr>"+
						"<tr><td>Faculty ID:</td><td>"+result.Courses[0].FacultyId+"</td></tr>"+
						"<tr><td>Course Name:</td><td>"+result.Courses[0].Name+"</td></tr>"+
						"<tr><td>Start Date:</td><td>"+startDate+"</td></tr></table>");
			//}
				$( "#info" ).dialog( "open" );
		}
		
	});

}

function studentInfo(studentId ){
	//alert(studentId);
	Util.ajaxGet('users/user/'+studentId, function(result) {
		//alert(JSON.stringify(result));
		if(result.Status){
			//alert(result.Status);
			$("#info").empty();
			//for(i=0;i<result.User.length;i++){
				//alert("hello in dialogue");
				
				$("#info").append("<table style='width:100%'><tr><td>ID:</td><td>"+result.User._id+"</td></tr>"+
						"<tr><td>Email:</td><td>"+result.User.Email+"</td></tr>"+
						"<tr><td>First Name:</td><td>"+result.User.FirstName+"</td></tr>"+
						"<tr><td>Last Name:</td><td>"+result.User.LastName+"</td></tr>"+
						"<tr><td>User Name:</td><td>"+result.User.Name+"</td></tr></table>");
				
			//}
			$( "#info" ).dialog( "open" );
		}
		
		
		
	});
}
function view( studentId , courseId , courseFormId ){
	var selfAssessMarks = [];
	var selfComments = [];
	var submittedDate;
	var lecturerMarks=[];
	var lecturerComments=[];
	//alert("student id:"+studentId+", course id:"+courseId);
	Util.ajaxGet('users/user/'+studentId, function(result) {
		if(result.Status){
			$("#info").empty();
			$("#info").append("<table id='viewTable'><tr>"+
					"<td>Student Name:</td><td>"+result.User.FirstName+"&nbsp;"+result.User.LastName+"</td>" +
							"</tr></table>")
			
		}
	});
	Util.ajaxGet('courses/get/'+courseId, function(result){
		
		if(result.Status){
			$("#viewTable").append("<tr><td>Course Name:</td><td>"+result.Courses[0].Name+"</td></tr>")
		}
	});
	Util.ajaxGet('courseforms/assess/faculty/'+courseFormId+'/'+studentId, function(result){
				//alert(JSON.stringify(result));
				
				if( result.Status ){
				for( i=0 ; i<result.Form.SelfAssessedCount ; i++){
					selfAssessMarks[i]=result.Form.Tasks[i].SelfAssessment;
					
					
		}
				for( i=0 ; i<result.Form.SelfAssessedCount ; i++ ){
					selfComments[i]=result.Form.Tasks[i].SelfComments;	
				}
				for( i=0 ; i<result.Form.FacultyAssessedCount ; i++ ){
					lecturerComments[i]=result.Form.Tasks[i].FacultyComments
				}
				for( i=0 ; i<result.Form.FacultyAssessedCount ; i++ ){
					lecturerMarks[i]=result.Form.Tasks[i].FacultyAssessment
				}
				var date=result.Form.SubmittedOn;
				var dated = new Date(date);
				submittedDate=(dated.getMonth() + 1) + '/' + dated.getDate() + '/' +  dated.getFullYear();
				$("#viewTable").append("<tr><td>Submitted Date:</td><td>"+submittedDate+"</td></tr>")
				}
				
				Util.ajaxGet('courseforms/get/'+courseFormId, function(result){
					//alert(JSON.stringify(result));
					
					$("#info").append("<table style='width:100%' id='tasksTable'><tr>"+
							"<th>Tasks &nbsp;&nbsp;</th><th>SelfAssessed Marks &nbsp;&nbsp;</th>"+
							"<th>Self Comments &nbsp;&nbsp;</th><th>Max Marks&nbsp;&nbsp;</th>"+
							"<th>LecturerComments</th><th>LecturerMarks</th></tr></table>")
					
					if(result.Status){
						
						//alert(selfAssessMarks);
						for( i=0 ; i<result.CourseForm.Tasks.length ; i++ ){
							var text=result. CourseForm.Tasks[i].Name;
								if(text.length>=7){
									var txt=text.substr(0,3)+"..."+text.substr(text.length-4,text.length-1);
									//alert(txt);
									//alert(text.length-4)
									//alert(text.length-1)
									text = txt;
									//alert(text)
								}
							
							$("#tasksTable").append("<tr><td>"+text+"&nbsp;&nbsp;</td>"+
									"<td>"+selfAssessMarks[i]+"&nbsp;&nbsp;</td>"+
									"<td>"+selfComments[i]+"&nbsp;&nbsp;</td>"+
									"<td>"+result.CourseForm.Tasks[i].MaxMarks+"&nbsp;&nbsp;</td>" +
											"<td>"+lecturerComments[i]+"</td>" +
													"<td>"+lecturerMarks[i]+"</td></tr>")
						}
					}
				})
				
			})
	
	
	
	$( "#info" ).dialog( "open" );
}

function assess(studentId,courseId,courseFormId){
	//alert("studentId"+studentId+","+courseId+",courseId")
	
	var selfAssessMarks = [];
	var selfComments = [];
	var submittedDate;
	var count=0;
	var tomax=0;
	//alert("student id:"+studentId+", course id:"+courseId);
	Util.ajaxGet('users/user/'+studentId, function(result) {
		if( result.Status ){
			$("#info").empty();
			$("#info").append("<table id='viewTable'><tr><td>Student Name:</td>"+
					"<td><span style='margin-left:-7px'>"+result.User.FirstName+"&nbsp;"+result.User.LastName+"</span></td></tr></table>")
			
		}
	});
	Util.ajaxGet('courses/get/'+courseId, function(result){
		
		if(result.Status){
			$("#viewTable").append("<tr><td>Course Name:</td><td><span  style='margin-left:-10px'>"+result.Courses[0].Name+"</span></td></tr>")
		}
	})
	Util.ajaxGet('courseforms/assess/faculty/'+courseFormId+'/'+studentId, function(result){
		
				if(result.Status){
				for(i=0;i<result.Form.SelfAssessedCount;i++){
					selfAssessMarks[i]=result.Form.Tasks[i].SelfAssessment;
					
					
		}
				for(i=0;i<result.Form.SelfAssessedCount;i++){
					selfComments[i]=result.Form.Tasks[i].SelfComments;	
				}
				var date=result.Form.SubmittedOn;
				var dated = new Date(date);
				submittedDate=(dated.getMonth() + 1) + '/' + dated.getDate() + '/' +  dated.getFullYear();
				$("#viewTable").append("<tr><td>Submitted Date:</td><td>"+submittedDate+"</td></tr>")

				}
				
				Util.ajaxGet('courseforms/get/'+courseFormId, function(result){
					//alert(JSON.stringify(result));
						
						$("#info").append("Enter all Maximium Marks:<input type='checkbox' id='lentermaxmarks'><table style='width:100%' id='tasksTable'><tr><th>Tasks</th>" +
								"<th>SelfAssessed Marks</th><th>Self Comments</th>"+
								"<th>Max Marks</th><th>Lecturere Assessment</th><th></th>" +
								"<th>Lecturer Comments</th></tr></table>")
						
						if(result.Status){
							
							
							for(i=0;i<result.CourseForm.Tasks.length;i++){
								count=count+1;
								var text=result. CourseForm.Tasks[i].Name;
								if(text.length>=7){
									var txt=text.substr(0,3)+"..."+text.substr(text.length-4,text.length-1);
									//alert(txt);
									//alert(text.length-4)
									//alert(text.length-1)
									text = txt;
									//alert(text)
								}
								tomax = tomax + parseInt(result.CourseForm.Tasks[i].MaxMarks);
								if(i == result.CourseForm.Tasks.length-1){
									$("#tasksTable").append("<tr><td>"+text+"</td><td>"+selfAssessMarks[i]+"</td>" +
											"<td>"+selfComments[i]+"</td>" +
											"<td>"+result.CourseForm.Tasks[i].MaxMarks+"</td>+" +
											"<td><input type='text' id='lmarks_"+i+"'></td>" +
													"<td id='lmarks_con_"+i+"'></td>"+ 
											"<td><input type='text' id='lcomments_"+i+"' onchange=totalmarks("+
											result.CourseForm.Tasks.length+",'lmarks_','totalmarks')></td>" +
													"<td id='lcomments_con_"+i+"'></td></tr>");
									
								}
								else{
									$("#tasksTable").append("<tr><td>"+text+"</td><td>"+selfAssessMarks[i]+"</td>" +
											"<td>"+selfComments[i]+"</td>" +
											"<td>"+result.CourseForm.Tasks[i].MaxMarks+"</td>+" +
											"<td><input type='text' id='lmarks_"+i+"'></td>" +
													"<td id='lmarks_con_"+i+"'></td>"+ 
											"<td><input type='text' id='lcomments_"+i+"'></td>" +
													"<td id='lcomments_con_"+i+"'></td></tr>");
									
								}
							}
							$("#tasksTable").append("<tr><td>Total Max Marks:</td><td>"+result.CourseForm.MaxMarks+"</td></tr>" +
									"<tr><td>Total Marks:</td><td id='totalmarks'></td><td id='ltot_err'</tr>"+
									"<tr><td colspan='4'><button " +
									"onclick=assessSubmit('"+studentId+"','"+courseFormId+"','"+count+"','"+result.CourseForm.MaxMarks+"')>" +
									"submit</button></td></tr>")
						}
						$("#lentermaxmarks").change(function(){
									//alert("hello");
						
							
							for(i=0;i<result.CourseForm.Tasks.length;i++){
								
								$("#lmarks_"+i).val(result.CourseForm.Tasks[i].MaxMarks);
							}
								
							});
					})
				
							
			})
	
	
	
	
	$( "#info" ).dialog( "open" );
	
}

function assessSubmit(studentId,courseFormId,count,totalmarks){
	//alert("assess submit")
	
	var sno=0;
	var tasks=[];
	var total=0;
	for(i=0;i<count;i++){
		sno=sno+1;
		var lmarks=$("#lmarks_"+i).val();
		var lcomments=$("#lcomments_"+i).val();
		if(lmarks == "" || lmarks == ""){
			$("#lmarks_con_"+i).append("Enter Marks");
			return false;
		}
		else{}
		if(isNaN(lmarks)){
			$("#lmarks_con_"+i).append("Enter Digits")
			return false;
		}
		else{}
		if(lcomments == "" || lcomments == ""){
			$("#lcomments_con_"+i).append("Enter Comments");
			return false;
		}
		//alert(lmarks)
		total=total+parseInt(lmarks)
		//alert(lcomments)
		tasks.push({"Number": sno,"FacultyAssessment":lmarks,"FacultyComments":lcomments})
		
		
	}
	//alert("in tasks if");
	//alert(tasks.length);
	//alert("total"+total)
		//alert(totalmarks)
		if(total>totalmarks){
			$("#ltot_err").empty()
			$("#ltot_err").append("please enter the marks less than the maximium marks")
			return false
		}
		else{}
	var crse = {
			Tasks:tasks
		};
		
	Util.ajaxPost('courseforms/assess/faculty/'+courseFormId+'/'+studentId , { criteria : { AssessedForm: crse } }, function(result) {
		//alert(JSON.stringify(result));
		if(result.Status){
				//alert("done");	
				Util.ajaxPost('courseforms/assess/faculty/'+courseFormId+'/'+studentId+'/approve', {}, function(result) {
					//renderAPIInfo($(".assessments-btns"), "POST", api);
					if (result.Status) {
						$("#info").empty();
						$("#info").append("<span style='color:#0000FF'>Assessment Form is Submitted</span>")
					} else {
						//renderErrorMessage($(".assessments-res"), result);
						$("#info").empty();
						$("#info").append("<span style='color:#FF0040'>Assessment Form is not Submitted</span>")
					}
  				});
			}
		})
}


function selfAssess(courseFormId,studentId,courseId){
	
	//alert(courseFormId);
	
	
	
			setTimeout(function(){
				
				
				$( "#info" ).dialog( "close" );}, 1800000);
		
		
	
	var count=0;
	Util.ajaxGet('users/user/'+studentId, function(result) {
		
		
		
		if( result.Status ){
			$("#info").empty();
			$("#info").append("Submit the form in 30 minutes..............");
			$("#info").append("<table  id='selfAssessTable'><tr><td>Student Name:</td>"+
				"<td><span style='margin-left: -22px;'>"+result.User.FirstName+"&nbsp;"+result.User.LastName+"</span></td></tr></table>")
			
		}
		Util.ajaxGet('courses/get/'+courseId, function(result){
			
			if(result.Status){
				//$("#info").empty();
				$("#selfAssessTable").append("<table><tr><td>Course Name:</td><td>"+result.Courses[0].Name+"</td></tr></table>")
			}
		})
		
		Util.ajaxGet('courseforms/get/'+courseFormId, function(result){
					//alert(JSON.stringify(result));
						
		$("#info").append("Enter all Maximium Marks:<input type='checkbox' id='entermaxmarks'><table style='width:100%' id='selfTasksTable'><tr><th>Number</th><th>Tasks</th>" +
				"<th>Maximum Marks</th><th>SelfAssessed Marks</th><th></th><th>Self Comments</th>"+
					"</tr></table>")
		
		if(result.Status){
			for(i=0;i<result.CourseForm.Tasks.length;i++){
				count=count+1;
				var tomax=0;
				var text=result. CourseForm.Tasks[i].Name;
								if(text.length>=7){
									var txt=text.substr(0,3)+"..."+text.substr(text.length-4,text.length-1);
									//alert(txt);
									//alert(text.length-4)
									//alert(text.length-1)
									text = txt;
									//alert(text)
								}
				tomax = tomax+parseInt(result.CourseForm.Tasks[i].MaxMarks);
								//alert(selfAssessMarks[i])
				if(i == result.CourseForm.Tasks.length-1){
					$("#selfTasksTable").append("<tr><td>"+result. CourseForm.Tasks[i].Number+"</td><td>"+text+"</td>"+"" +
							"<td>"+result.CourseForm.Tasks[i].MaxMarks+"</td>"+
							"<td><input type='text' id='smarks_"+i+"'></td><td id='smarkscon_"+i+"'></td>" +
									"<td><input type='text' id='scomments_"+i+"' " +
											"onchange=totalmarks("+result.CourseForm.Tasks.length+",'smarks_','totmarks')></td>" +
													"<td id='scommentscon_"+i+"' ></td>"+
											"</tr>")
				}
				else{
				$("#selfTasksTable").append("<tr><td>"+result. CourseForm.Tasks[i].Number+"</td><td>"+text+"</td>"+"" +
						"<td>"+result.CourseForm.Tasks[i].MaxMarks+"</td>"+
						"<td><input type='text' id='smarks_"+i+"'></td><td id='smarkscon_"+i+"'></td>" +
								"<td><input type='text' id='scomments_"+i+"'></td><td id='scommentscon_"+i+"'></td>"+
										"</tr>")
				}
				}
			
				$("#selfTasksTable").append("<tr><td>Total Max Marks:</td><td id='stotmarks'>"+result.CourseForm.MaxMarks+"</td></tr>" +
						"<tr><td>Total Marks:</td><td id='totmarks'></td><td id='stot_err'></td></tr><tr><td colspan='4'>"+
					"<button onclick=selfAssessSubmit('"+courseFormId+"','"+count+"',"+result.CourseForm.MaxMarks+")>submit</button></td>" +
							"</tr>")
				
			
						$("#entermaxmarks").change(function(){
									//alert("hello");
						
							
							for(i=0;i<result.CourseForm.Tasks.length;i++){
								
								$("#smarks_"+i).val(result.CourseForm.Tasks[i].MaxMarks);
							}
								
							});
							
				
				}
				})
	});
	$( "#info" ).dialog( "open" );
}

function selfAssessSubmit(courseFormId,count,totalmarks){
	
		
		var sno=0;
		var tasks=[];
		var total=0;
		
		for(i=0;i<count;i++){
			sno=sno+1;
			var smarks=$("#smarks_"+i).val();
			//alert(smarks);
			var scomments=$("#scomments_"+i).val();
			if(smarks == "" || smarks == null){
				$("#smarkscon_"+i).append("Please Enter the Marks")
				return false;
			}
			else{}
			if(isNaN(smarks)){
				$("#smarkscon_"+i).append("Please Enter Digits")
				return false;
			}
			else{}
			
			if(scomments == "" || scomments == null){
				$("#scommentscon_"+i).append("Please Enter Comments");
				return false;
			}
			else{}
			total=total+parseInt(smarks);
			//alert(scomments)
			tasks.push({"Number": sno,"SelfAssessment":smarks,"SelfComments":scomments})
			
			
		}
		//alert("in tasks if");
		//alert(tasks.length);
		//alert("total"+total)
		//alert(totalmarks)
		if(total>totalmarks){
			$("#stot_err").empty()
			$("#stot_err").append("Please enter the marks less than the Maximium Marks")
			return false
		}
		else{}
		var crse = {
				Tasks:tasks
			};
			
		Util.ajaxPost('courseforms/assess/self/'+courseFormId, { criteria : { SubmittedForm: crse } }, function(result) {
			//alert(JSON.stringify(result));
			if(result.Status){
					//alert("done");	
					Util.ajaxPost('courseforms/assess/self/'+courseFormId+'/submit', {}, function(result) {
						//renderAPIInfo($(".assessments-btns"), "POST", api);
						if (result.Status) {
							$("#info").empty();
							$("#info").append("<span style='color:#0000FF'>Assessment Form is Submitted</span>")
						} else {
							//renderErrorMessage($(".assessments-res"), result);
							$("#info").empty();
							$("#info").append("<span style='color:#F00000'>Assessment Form is not Submitted</span>")
						}
	  				});
				}
			else{}
			})
			
			
	
	
}
function viewScores ( courseId ) {
	$("#info").empty();
	var selfAssessMarks = [];
	var selfComments = [];
	//var submittedDate;
	var lecturerMarks=[];
	var lecturerComments=[];
	Util.ajaxGet('courses/get/'+courseId, function(result){
		
		if(result.Status){
			//alert("in course ajax")
			
			$("#info").append("<table><tr><td>Course Name:</td><td>"+result.Courses[0].Name+"</td>"+
					"</tr></table>")
		}
	})
	Util.ajaxGet('courseforms/on/'+courseId, function(result){
		if(result.Status){
			for ( i=0 ; i<result.Form.length ; i++ ){
				
				var courseFormId=result.Form[i].CourseFormId;
				//alert(courseFormId);
				var studentId=result.Form[i].StudentId;
				//alert(studentId);
				for(j=0;j<result.Form[i].SelfAssessedCount;j++){
					selfAssessMarks[j]=result.Form[i].Tasks[j].SelfAssessment
					}
				for(j=0;j<result.Form[i].SelfAssessedCount;j++){
					selfComments[j]=result.Form[i].Tasks[j].SelfComments
					}
				
				for(j=0;j<result.Form[i].FacultyAssessedCount;j++){
					lecturerComments[j]=result.Form[i].Tasks[j].FacultyComments
					}
				
				for(j=0;j<result.Form[i].FacultyAssessedCount;j++){
					lecturerMarks[j]=result.Form[i].Tasks[j].FacultyAssessment
					}
				
				Util.ajaxGet('courseforms/get/'+result.Form[i].CourseFormId, function(result){
					if( result.Status ){
						$("#info").append("<span>Form Name:</span><span>"+result.CourseForm.FormName+"</span>")
						$("#info").append("")
							for( i=0 ; i<result.CourseForm.Tasks.length ; i++ ){
								var text=result. CourseForm.Tasks[i].Name;
								if(text.length>=7){
									var txt=text.substr(0,3)+"..."+text.substr(text.length-4,text.length-1);
									//alert(txt);
									//alert(text.length-4)
									//alert(text.length-1)
									text = txt;
									//alert(text)
								}
								
								$("#info").append("<table style='width:100%' id='tasksTable'><tr>"+
							"<th>Task Name &nbsp;&nbsp;</th><th>SelfAssessed Marks &nbsp;&nbsp;</th>"+
							"<th>Self Comments &nbsp;&nbsp;</th><th>Max Marks&nbsp;&nbsp;</th>"+
							"<th>LecturerComments</th><th>LecturerMarks</th></tr>" +
										"<tr><td>"+text+"&nbsp;&nbsp;</td>"+
										"<td>"+selfAssessMarks[i]+"&nbsp;&nbsp;</td>"+
										"<td>"+selfComments[i]+"&nbsp;&nbsp;</td>"+
										"<td>"+result.CourseForm.Tasks[i].MaxMarks+"&nbsp;&nbsp;</td>" +
												"<td>"+lecturerComments[i]+"</td>" +
														"<td>"+lecturerMarks[i]+"</td></tr></table>")
							}
					}
				})
			}
		}
		//alert(JSON.stringify(result));
		//$("#info").append(JSON.stringify(result));
	})
	$( "#info" ).dialog( "open" );
}

function displayForms(){
	var courseForms=[];
	var courseId=$("#mycourse").val();
	//alert(courseId);
	Util.ajaxGet('courses/forms/'+courseId, function(result) {
		//renderAPIInfo($(".forms1-btns"), "GET", api);
			if (result.Status) {
				//alert(JSON.stringify(result));
				for( i= result.CourseForms.length-1; i >= 0; i-- ){
					//alert( result.CourseForms[i].FormStatus )
					if( result.CourseForms[i].FormStatus ){
						//courseFormId[i] = result.CourseForms[i]._id;
						//i++;
						//alert(i);
						result.CourseForms.splice(i,1);
						
					}
					else{
						$("#forms").append("<tr><td>"+result.CourseForms[i].CourseName+"</td><td>"+result.CourseForms[i].FormName+"</td>" +
								"<td><button onclick=sendForms('"+result.CourseForms[i]._id+"')>send</button></td></tr>")
						
				}
				//	$("#forms").append("<tr><td>"+result.CourseForms[i].CourseName+"</td><td>"+result.CourseForms[i].FormName+"</td><td><button onclick=sendForms('"+result.CourseForms[i]._id+"')>send</button></td></tr>")
			} 
				/*for(i=0;i<courseForms.length;i++){
					//alert()
					
					$("#forms").append("<tr><td>"+courseForms[i].CourseName+"</td><td>"+courseForms[i].FormName+"</td><td><button onclick=sendForms('"+courseForms[i]._id+"')>send</button></td></tr>")
				}*/
			}else {
				alert("not done");
			}
		});
}
function sendForms ( formId ) {
	//alert("sendforms"+formId)
	var api = "courseforms/send/"+formId;
		Util.ajaxPost ( api, {}, function ( result ) {
		//renderAPIInfo($(".forms1-btns"), "POST", api);
		if ( result.Status ) {
			$(".result").empty();
			$(".result").append("<span style='color:#04B4AE'>Assessment Form is Sent</span>")
		} else {
			$(".result").empty();
			$(".result").append("<span style='color:#F00000'>Assessment Form is not Sent</span>")
		}
		});
}

function addCourse(){
	
	//alert("in add course")
	$(".result").empty();
	$(".result").append("<table><tr><td>Course Name:</td><td><input id='courseName' type='text'></td>"+
			"<td id='courseName_con'></td></tr>"+
			"<tr><td>Start Date:</td><td><input id='startDate' type='text'></td><td id='startDate_con'></td>"+
			"</tr>"+
			"<tr><td>End Date:</td><td><input id='endDate' type='text'></td><td id='endDate_con'></td></tr>"+
			"<td><button id='courseSubmit'>submit</button></td></tr></table>");
	$(' #startDate ').datepicker();
	$(' #endDate ').datepicker();
	$(" #courseSubmit ").click(function(){
		//alert("course submit");
		var courseName=$('#courseName').val();
		var startDate=$('#startDate').val();
		var endDate=$('#endDate').val();
		if( courseName == "" || courseName == null){
			$("#courseName_con").append("Please Enter the course name");
			return false;
		}
		else{
			$("#courseName_con").empty();
		}
		if( startDate == "" || startDate == null){
			$("#startDate_con").append("Please Select a Date");
			return false;
		}
		else{
			$("#startDate_con").empty();
		}
		if( endDate == "" || endDate == null){
			$("#endDate_con").append("Please Select a Date");
			return false;
		}
		else{
			$("#endDate_con").empty();
		}
		var api = 'courses/save';
		var crse = {
			Name: courseName,
			StartDate: startDate,
			EndDate: endDate
		};
			Util.ajaxPost(api, { criteria: { course: crse } }, function(result) {
			//renderAPIInfo($(".courses-btns"), "POST", api);
				//alert(JSON.stringify(result))
				if (result.Status) {
					$(".result").empty();
					$(".result").append("<span style='color:#00FF66'>Your Course is Saved</span>")
					/*$(".result").append("<br><h1>courses given</h1>")
					$(".result").append("The following are the courses given by you")
					$(".result").append("<table id='courselis'></table")*/
	/*Util.ajaxGet("courses/igive", function(result)  {
		
		
		//alert(JSON.stringify(result));
	
		if(result.Courses.length>0){
			
			
			for(i=0;i<result.Courses.length;i++){
			//	alert(JSON.stringify(result));
				
			
				//alert(result.Courses[i]._id)
					$("#courselis").append(""+
							"<tr><td>"+result.Courses[i].Name+"</td>"+
							"<td><button class='btn btn-link' id='addstudent' "+
							"onclick=addstudent('"+result.Courses[i]._id+"')>Add Student</button></td></tr>");
					
					
								}
					}
			});*/
					
					
					/*$("#courselis").after("<tr><td>"+result.Course.Name+"</td>"+
							"<td><button class='btn btn-link' id='addstudent' "+
							"onclick=addstudent('"+result.Course._id+"')>Add Student</button></td></tr>")
							submittedforms();*/
					//$("#courselis").append("fggdfgdfgfdgfdgdfgfdgfdqf")
					//studentdisplaycourselist();
					//formspending();
				} else {
					$(".result").empty();
					$(".result").append("<span style='color:#F00000'>Your Course is not Saved</span>")
				}
			});
	})
}
function totalmarks(len,attr,apattr){
	//alert("hello");
	var total = 0;
	//alert(attr+1);
	for(i=0;i<len;i++){
		var marks = parseInt($("#"+attr+i).val());
		total=total+marks;
	}
	//alert(total);
	$("#"+apattr).empty();
	$("#"+apattr).append(total);
}

function totalmarksone(len,attr,apattr){
	//alert("hello");
	var total = 0;
	//alert(attr+1);
	for(i=1;i<=len;i++){
		var marks = parseInt($("#"+attr+i).val());
		total=total+marks;
	}
	//alert(total);
	$("#"+apattr).append(total);
}

