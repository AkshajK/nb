<template>
  <div class="form">
    <h1 class="title">User Profile & Settings</h1>
    <div id="profile-info-box">    
      <h2>Your current profile information</h2>
      <p><b>Username:</b> {{user.username}}</p>    
      <p><b>Email:</b> {{user.email}}</p>    
      <p><b>Name:</b> {{user.first_name}} {{user.last_name}}</p>    
    </div>
    <div class="profile-row">
      <h2>Personal Details</h2>
      <div class="group">
        <label for="new-user-username"> Username: </label>
        <input id="new-user-username" type="text" v-model="newUser.username" >
      </div>
      <div class="group">
        <label for="new-user-first"> First name: </label>
        <input id="new-user-first" type="text" v-model="newUser.first" >
      </div>

      <div class="group">
        <label for="new-user-last"> Last name: </label>
        <input id="new-user-last" type="text" v-model="newUser.last">
      </div>

      <div class="group">
        <label for="new-user-email"> Email: </label>
        <input id="new-user-email" type="text" v-model="newUser.email">
      </div>
        <button class="submit" id="personal" :disabled="!submitPersonalEnabled" @click="editPersonal">
          Save
        </button>
      <span class="profile-message"><br>{{personalMessage}}<br></span>
      <br>
      <h2>Authentication</h2>
      <div class="group">
        <label for="new-user-newpassword"> New Password: </label>
        <input id="new-user-newpassword" type="password" v-model="newUser.newpassword">
      </div>
      <div class="group">
        <label for="new-user-retypepassword"> Retype Password: </label>
        <input id="new-user-retypepassword" type="password" v-model="newUser.retypepassword">
      </div>
        <button class="submit" id="auth" :disabled="!submitAuthEnabled" @click="editAuth">
          Save
        </button>
      <span class="profile-message"><br>{{authMessage}}<br></span>
    </div>
  </div>
</template>

<script>
  import axios from "axios"
  import { eventBus } from "../../main"

  export default {
    name: "user-profile",
    props: {
      user: Object,
      default: null,
    },
    data() {
      return {
        newUser: {
          username: "",
          first: "",
          last: "",
          email: "",
          newpassword: "",
          retypepassword: "",
        },
        personalMessage: "",
        authMessage: "",
      }
    },
    computed: {
      submitPersonalEnabled: function() {
        return this.newUser.username.length > 0
          && this.newUser.first.length > 0
          && this.newUser.last.length > 0
          && this.newUser.email.length > 0
      },
      submitAuthEnabled: function() {
        if (this.newUser.newpassword !== this.newUser.retypepassword) {
          this.setAuthMessage("Passwords must match", false);
        } else {
          this.setAuthMessage("", false);
        }
        return this.newUser.newpassword.length > 0
          && this.newUser.newpassword === this.newUser.retypepassword
      },
    },
    methods: {
      editPersonal: function() {
        axios.put("api/users/editPersonal", this.newUser)
        .then(() => {
          this.setPersonalMessage("Success: Personal Details saved");
        })
        .catch(() => {
          this.setPersonalMessage("Error: This username is already taken. Please try another username.", false)
        })
      },
      editAuth: function() {
        axios.put("api/users/editAuth", this.newUser)
        .then(() => {
          this.setAuthMessage("Success: New password saved", true)
        })
        .catch(err => {
          console.log("Error: An error was encountered whne trying to update you password. Please try again.")
        })
      },
      
      resetForm: function() {
        this.newUser = {
          username: "",
          first: "",
          last: "",
          email: "",
          newassword: "",
        }
      },
      setPersonalMessage: function(msg, disappear=true, error=false) {
        this.personalMessage = msg;
        if (disappear) {
          setTimeout(() => this.personalMessage = "", 1000);
        }
      },
      setAuthMessage: function(msg, disappear=true) {
        this.authMessage = msg;
        if (disappear) {
          setTimeout(() => this.authMessage = "", 1000);
        }
      },
    },
  }
</script>

<style scoped>
  .form {
    width: 380px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    margin: auto;
  }
  .form .title {
    margin: 0;
    padding: 10px 0 20px 0;
  }
  .form .group {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
  }
  .form .group label {
    margin-right: 5px;
  }
  .form .group input {
    padding: 4px 6px;
    border-radius: 3px;
    border: solid 1px #aaa;
    font-size: 16px;
    flex-grow: 1;
  }

  .profile-row {
    /* display: flex;
    flex-direction: row;
    flex-wrap: wrap; */
    /* width: 100%; */
  }
  .buttons {
    width: 380px;
    /* display: flex; */
    /* flex-direction: row; */
    /* padding: 20px; */
  }
  button.submit {
    width: 80px;
    align-self: flex-end;
    padding: 6px 0;
    border-radius: 5px;
    border: solid 1px #007bff;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
  }

  button.cancel {
    width: 80px;
    align-self: flex-start;
    padding: 6px 0;
    border-radius: 5px;
    /* border: solid 1px #007bff; */
    /* background-color: #007bff; */
    /* color: #fff; */
    font-size: 16px;
    cursor: pointer;
  }
  button.submit:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  button.submit:enabled:hover {
    background-color: #0069d9;
  }

  /* .profile-message {
    color: green;
  } */

  #profile-info-box {
    border: 1px solid;
    padding: 6px 6px 6px 6px;
  }

</style>
