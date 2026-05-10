(function ($) {
  let allowedExtns = ["image/jpeg", "image/png", "image/webp"];
  const allowedTags = [
    "park",
    "pier",
    "lake",
    "river",
    "beach",
    "quiet",
    "calm",
    "scenic",
    "view",
    "sunset",
    "nature",
    "walk",
    "hike",
    "trail",
    "grass",
    "trees",
    "garden",
    "picnic",
    "study",
    "date",
    "friends",
    "family",
    "food",
    "coffee",
    "shops",
    "photo",
    "skyline",
    "water",
    "fishing",
    "sports",
    "bike",
    "dog",
    "kids",
    "safe",
    "crowded",
    "hidden",
    "relax",
    "urban",
    "open",
    "shade",
    "sunny",
    "benches",
    "free",
    "clean",
    "music",
    "art",
    "historic",
    "night",
    "morning",
    "chill",
  ];

  function displayErrors(errors) {
    let errorsElem = $("#errors");
    if (errorsElem.length === 0) {
      errorsElem = $('<ul id="errors" class="errorList"></ul>');
      if ($("main").length > 0) {
        $("main").first().prepend(errorsElem);
      } else if ($(".card").length > 0) {
        $(".card").first().prepend(errorsElem);
      } else {
        $("body").prepend(errorsElem);
      }
    }
    errorsElem.empty();
    for (let e of errors) {
      error = $("<li></li>").text(e);
      errorsElem.append(error);
    }
  }
  function valueFromId(id) {
    let e = $("#" + id);
    if (e.length === 0 || e.val() === undefined || e.val() === null) return "";
    return e.val().trim();
  }
  function onlyDigits(s) {
    return /^\d+$/.test(str);
  }
  function validName(name) {
    if (!name || onlyDigits(name) || name.length < 1 || name.length > 50)
      return false;
    return /^[A-Za-z\- ;]+$/.test(name);
  }
  function validObjID(id) {
    return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id.trim());
  }
  function validEmail(email) {
    if (!email || onlyDigits(email)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
  }
  function validUsername(user) {
    if (!user || onlyDigits(user.toLowerCase())) return false;
    user = user.toLowerCase().trim();
    if (user.length < 3 || user.length > 20) return false;
    return /^[a-z0-9_]+$/.test(user);
  }
  function strongPassword(pw) {
    if (!pw || onlyDigits(pw)) return false;
    return (
      pw.length > 7 &&
      pw.length < 65 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  }
  function validLocationName(name) {
    if (!name || onlyDigits(name)) return false;
    if (name.length < 1 || name.length > 100) return false;
    return /^[A-Za-z0-9 .'-]+$/.test(name);
  }
  function validAddress(addr) {
    if (!addr || onlyDigits(addr)) return false;
    if (addr.length < 5 || addr.length > 200) return false;
    return /^[A-Za-z0-9 .,'#&()/\-]+$/.test(addr);
  }
  function validZip(zip) {
    return /^\d{5}$/.test(zip);
  }
  function validCoord(c) {
    return /^-?\d+(\.\d+)?$/.test(c);
  }
  function validLat(c) {
    if (!validCoord(c)) return false;
    let n = Number(c);
    return !Number.isNaN(n) && (n >= -90) & (n <= 90);
  }
  function validLng(c) {
    if (!validCoord(c)) return false;
    let n = Number(c);
    return !Number.isNaN(n) && (n >= -180) & (n <= 180);
  }
  function validImgs(id, errors, type, maxImgs) {
    let input = $("#" + id)[0];
    if (!input || !input.files || input.files.length === 0) return;
    if (input.files.length > maxImgs) {
      errors.push(type + "can include up to " + maxImgs + " image(s).");
    }
    for (let img of input.files) {
      if (!allowedExtns.includes(file.type)) {
        errors.psuh(type + "must contain JPG, PNG, or WEBP image(s)");
      }
    }
  }
  function getTags(id) {
    let rawTags = valueFromId(id);
    if (!rawTags) return [];
    let tags = rawTags.split(",").map((tag) => tag.trim());
    return tags;
  }
  function validateTags(tags, errors, field) {
    if (tags.length > 10) {
      errors.push(field + "can only have 10 tags or less.");
      return;
    }
    for (let tag of tags) {
      if (tag.length < 1 || tag.length > 10) {
        errors.push("Each tag must have between 1 and 10 characters.");
        return;
      }
      if (!allowedTags.includes(tag)) {
        errors.push("Invalid tag selected: " + tag + ".");
      }
    }
  }
  $("#register-form").on("submit", function (event) {
    let errors = [];
    let firstName = valueFromId("firstName");
    let lastName = valueFromId("lastName");
    let username = valueFromId("username");
    let age = valueFromId("age");
    let email = valueFromId("email");
    let pw = valueFromId("password");
    let confirmPass = valueFromId("confirmPass");
    let adminSecret = valueFromId("adminSecret");
    if (!validName(firstName))
      errors.push(
        "First name must be 1-50 chars and contain letters, hyphens, spaces, or semicolons only.",
      );
    if (!validName(lastName))
      errors.push(
        "Last name must be 1-50 chars and contain letters, hyphens, spaces, or semicolons only.",
      );
    if (!validUsername(username))
      errors.push(
        "Username must be 3-20 chars and contain letters, numbers, or underscores only.",
      );
    if (!onlyDigits(age) || Number(age) < 13 || Number(age > 120))
      errors.push("Age must be an integer between 13 and 120.");
    if (!validEmail(email)) errors.push("Email must be a valid email.");

    if (!strongPassword(pw))
      errors.push(
        "Password must be 8-64 chars and must include uppercase and lowercase letters, at least one number, and at least one special character.",
      );
    if (pw !== confirmPass) errors.push("Passwords do not match.");
    if (adminSecret && adminSecret !== "SecretAdminKey") {
      errors.push(
        "Admin secret is not correct. Leave blank to remain a standard user.",
      );
    }
    validImgs("profilePic", errors, "Profile picture", 1);

    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#signin-form").on("submit", function (event) {
    let errors = [];
    if (!validEmail(valueFromId("email"))) {
      errors.push("Email must be a valid email.");
    }
    let pw = valueFromId("password");
    if (!pw) {
      errors.push("Password field is required.");
    }
    if (!strongPassword(pw))
      errors.push(
        "Password must be 8-64 chars and must include uppercase and lowercase letters, at least one number, and at least one special character.",
      );
    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#addLocationForm").on("submit", function (event) {
    let errors = [];
    let name = valueFromId("name");
    let address = valueFromId("address");
    let zip = valueFromId("zip");
    let lat = valueFromId("lat");
    let lng = valueFromId("lng");
    let tags = getTagsFromForm("tags");

    if (!validLocationName(name))
      errors.push(
        "Names of locations must be 1-100 chars and contain letters, numbers, spaces, periods, apostrophes, or hyphens only.",
      );
    if (!validAddress(address))
      errors.push(
        "Addresses must be 5-200 chars and contain valid address chars only.",
      );
    if (!validZip(zip)) errors.push("Zipcode must be 5 digits.");
    if (validLat(lat))
      errors.push("Latitude must be a valid number between -90 and 90.");
    if (validLng(lng))
      errors.push("Longitude must be a valid number between -180 and 180.");
    validateTags(tags, errors, "Location tags");
    validImgs("locPics", errors, "Location pictures", 5);

    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#reviewForm").on("submit", function (event) {
    let errors = [];
    let content = valueFromId("reviewTextInput");
    let safetyRating = valueFromId("reviewSafetyRating");

    if (!content || content.length > 1000) {
      errors.push("Review content must be 1-1000 chars.");
    }
    if (
      !isOnlyDigits(safetyRating) ||
      Number(safetyRating) < 1 ||
      Number(safetyRating) > 5
    )
      errors.push("Safety rating must be a whole number between 1 and 5.");

    validImgs("reviewPics", errors, "Review pictures", 5);
    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#profileForm").on("submit", function (event) {
    let errors = [];
    let firstName = valueFromId("firstName");
    let lastName = valueFromId("lastName");
    let username = valueFromId("username");
    let email = valueFromId("email");
    let currPw = valueFromId("password");
    let newPw = valueFromId("newPassword");
    let confirmPw = valueFromId("confirmNewPassword");

    if (!validName(firstName))
      errors.push(
        "First name must be 1-50 chars and contain letters, hyphens, spaces, or semicolons only.",
      );
    if (!validName(lastName))
      errors.push(
        "Last name must be 1-50 chars and contain letters, hyphens, spaces, or semicolons only.",
      );
    if (!validUsername(username))
      errors.push(
        "Username must be 3-20 chars and contain letters, numbers, or underscores only.",
      );
    if (!validEmail(email)) errors.push("Email must be a valid email.");

    if (newPw || confirmPw) {
      if (!currentPassword)
        errors.push(
          "Current password must be provided to change your password.",
        );
      if (!strongPassword(newPw))
        errors.push(
          "New password must be 8-64 chars and must include uppercase and lowercase letters, at least one number, and at least one special character.",
        );
      if (newPw !== confirmPw)
        errors.push("New password and confirmed new password do not match.");
    }
    validImgs("newProfilePic", errors, "Profile picture", 1);

    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#addFriendForm").on("submit", function (event) {
    let errors = [];
    let friendUser = valueFromId("friendUsername");

    if (!validUsername(friendUser))
      errors.push(
        "Username must be 3-20 chars and contain letters, numbers, or underscores only.",
      );
    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#publicListForm").on("submit", function (event) {
    let errors = [];
    let name = valueFromId("listName");
    let tags = getTagsFromForm("listTags");

    if (!listName || onlyDigits(name) || name.length < 1 || name.length > 100)
      errors.push("List name must be 1-100 chars and cannot be only digits.");

    validateTags(tags, errors, "List tags");

    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $("#editPublicListForm").on("submit", function (event) {
    let errors = [];
    let name = valueFromId("listName");

    if (!listName || onlyDigits(name) || name.length < 1 || name.length > 100)
      errors.push("List name must be 1-100 chars and cannot be only digits.");

    if (errors.length > 0) {
      event.preventDefault();
      showErrors(errors);
    } else {
      $("#errors").empty;
    }
  });
  $(".commentForm").on("submit", function (event) {});
  $(".reportForm").on("submit", function (event) {});
  $(".addLocationToListForm").on("submit", function (event) {});
  $(".deleteLocationFromListForm", ".delete-form").on(
    "submit",
    function (event) {},
  );
})(window.jQuery);
