const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Company = require("../../models/Company");
const Formfields = require("../../models/Formfields");

// @route   GET api/:company_id/bookings
// @desc    Get all users bookings
// @access  Public
router.get("/:company_id/bookings", auth, async (req, res) => {
  try {
    const companybookings = await Booking.find({
      companyId: req.params.company_id,
    })
      .populate("user", ["email", "firstName", "lastName", "phone"])
      .sort({ start_date: -1 });

    res.json(companybookings);
  } catch (error) {
    //console.error(err.message);
    res.status(500).send("Company Booking Server Error");
  }
});

// @route   GET api/company/mine
// @desc    Get current users company
// @access  Private
router.get("/mine", auth, async (req, res) => {
  try {
    // .populate will bring just the fields we need from another db document
    const company = await Company.findOne({
      user: req.user.id,
    }).populate("user", ["firstName", "lastName", "avatar"]);

    if (!company) {
      return res.status(400).json({
        msg: "There is no company for this user",
      });
    }

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.get("/formFields", auth, async (req, res) => {
  try {
    // .populate will bring just the fields we need from another db document
    const formField = await Formfields.find();
    console.log("---", formField);
    if (!formField) {
      return res.status(400).json({
        msg: "There is no field.",
      });
    }

    res.json(formField);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/company/mine
// @desc    Get current users company
// @access  Private
router.get("/liked", auth, async (req, res) => {
  try {
    // .populate will bring just the fields we need from another db document
    const company = await Company.find({
      "likes.user": req.user.id,
    });

    if (!company) {
      return res.status(200).json({
        msg: "You have yet to like any companies",
      });
    }

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/company/business
// @desc    Create a user business
// @access  Private
router.post(
  "/business",
  [auth, [check("name", "Name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      website,
      description,
      street_address,
      street_address_2,
      city,
      province,
      country,
      postal,
      email,
      phone,
      fax,
      lat,
      lng,
      facebook,
      twitter,
      linkedin,
      instagram,
      Sunday_open,
      Sunday_start_time,
      Sunday_end_time,
      Monday_open,
      Monday_start_time,
      Monday_end_time,
      Tuesday_open,
      Tuesday_start_time,
      Tuesday_end_time,
      Wednesday_open,
      Wednesday_start_time,
      Wednesday_end_time,
      Thursday_open,
      Thursday_start_time,
      Thursday_end_time,
      Friday_open,
      Friday_start_time,
      Friday_end_time,
      Saturday_open,
      Saturday_start_time,
      Saturday_end_time,
    } = req.body;

    // Build Company object
    const companyFields = {};
    companyFields.user = req.user.id;
    if (name) companyFields.name = name;
    if (website) companyFields.website = website;
    if (description) companyFields.description = description;
    if (email) companyFields.email = email;
    if (phone) companyFields.phone = phone;
    if (fax) companyFields.fax = fax;

    companyFields.store_hours = {
      Sunday: {
        open: Sunday_open,
        start_time: Sunday_start_time,
        end_time: Sunday_end_time,
      },
      Monday: {
        open: Monday_open,
        start_time: Monday_start_time,
        end_time: Monday_end_time,
      },
      Tuesday: {
        open: Tuesday_open,
        start_time: Tuesday_start_time,
        end_time: Tuesday_end_time,
      },
      Wednesday: {
        open: Wednesday_open,
        start_time: Wednesday_start_time,
        end_time: Wednesday_end_time,
      },
      Thursday: {
        open: Thursday_open,
        start_time: Thursday_start_time,
        end_time: Thursday_end_time,
      },
      Friday: {
        open: Friday_open,
        start_time: Friday_start_time,
        end_time: Friday_end_time,
      },
      Saturday: {
        open: Saturday_open,
        start_time: Saturday_start_time,
        end_time: Saturday_end_time,
      },
    };
    // Build social object
    companyFields.social = {
      facebook: facebook,
      twitter: twitter,
      linkedin: linkedin,
      instagram: instagram,
    };

    // Build location object
    companyFields.location = {
      lat: lat,
      lng: lng,
      street_address: street_address,
      street_address_2: street_address_2,
      city: city,
      province: province,
      country: country,
      postal: postal,
    };
    companyFields.geoLocation = {
      type: "Point",
      coordinates: [lat, lng],
    };

    // value must be in numeric. null value is not acceptable.
    if (lat && lng) {
      // Build  geo location object
      companyFields.geolocation = {
        type: "Point",
        coordinates: [lng, lat],
      };
    } else {
      // Build  geo location object
      companyFields.geolocation = {
        type: "Point",
        coordinates: [0, 0],
      };
    }
    companyFields.is_admin = true;

    try {
      // Create
      let company = new Company(companyFields);
      await company.save();
      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST api/company
// @desc    Create or update a user company
// @access  Private
router.post(
  "/",
  [auth, [check("name", "Name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      website,
      description,
      street_address,
      street_address_2,
      city,
      province,
      country,
      postal,
      email,
      phone,
      fax,
      lat,
      lng,
      facebook,
      twitter,
      linkedin,
      instagram,
      Sunday_open,
      Sunday_start_time,
      Sunday_end_time,
      Monday_open,
      Monday_start_time,
      Monday_end_time,
      Tuesday_open,
      Tuesday_start_time,
      Tuesday_end_time,
      Wednesday_open,
      Wednesday_start_time,
      Wednesday_end_time,
      Thursday_open,
      Thursday_start_time,
      Thursday_end_time,
      Friday_open,
      Friday_start_time,
      Friday_end_time,
      Saturday_open,
      Saturday_start_time,
      Saturday_end_time,
    } = req.body;

    // Build Company object
    const companyFields = {};
    companyFields.user = req.user.id;
    if (name) companyFields.name = name;
    if (website) companyFields.website = website;
    if (description) companyFields.description = description;
    if (email) companyFields.email = email;
    if (phone) companyFields.phone = phone;
    if (fax) companyFields.fax = fax;

    companyFields.store_hours = {
      Sunday: {
        open: Sunday_open,
        start_time: Sunday_start_time,
        end_time: Sunday_end_time,
      },
      Monday: {
        open: Monday_open,
        start_time: Monday_start_time,
        end_time: Monday_end_time,
      },
      Tuesday: {
        open: Tuesday_open,
        start_time: Tuesday_start_time,
        end_time: Tuesday_end_time,
      },
      Wednesday: {
        open: Wednesday_open,
        start_time: Wednesday_start_time,
        end_time: Wednesday_end_time,
      },
      Thursday: {
        open: Thursday_open,
        start_time: Thursday_start_time,
        end_time: Thursday_end_time,
      },
      Friday: {
        open: Friday_open,
        start_time: Friday_start_time,
        end_time: Friday_end_time,
      },
      Saturday: {
        open: Saturday_open,
        start_time: Saturday_start_time,
        end_time: Saturday_end_time,
      },
    };
    // Build social object
    companyFields.social = {
      facebook: facebook,
      twitter: twitter,
      linkedin: linkedin,
      instagram: instagram,
    };

    // Build location object
    companyFields.location = {
      lat: lat,
      lng: lng,
      street_address: street_address,
      street_address_2: street_address_2,
      city: city,
      province: province,
      country: country,
      postal: postal,
    };
    companyFields.geoLocation = {
      type: "Point",
      coordinates: [lat, lng],
    };

    // value must be in numeric. null value is not acceptable.
    if (lat && lng) {
      // Build  geo location object
      companyFields.geolocation = {
        type: "Point",
        coordinates: [lng, lat],
      };
    } else {
      // Build  geo location object
      companyFields.geolocation = {
        type: "Point",
        coordinates: [0, 0],
      };
    }

    try {
      // Update Database
      let company = await Company.findOne({ user: req.user.id });

      if (company) {
        // Update
        company = await Company.findOneAndUpdate(
          { user: req.user.id },
          { $set: companyFields },
          { new: true }
        );

        return res.json(company);
      }

      // Create
      company = new Company(companyFields);

      await company.save();
      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/company
// @desc    Get all companies
// @access  Public
router.get("/business", async (req, res) => {
  console.log("req", req.query);
  try {
    const { lat, lng, miles, page, limit, search } = req.query;
    if (search) {
      search.toLocaleLowerCase();
    }

    // if lat and long is not defined then return empty object

    //25 mile is approx 40233 m

    if (lat && lng) {
      const companies = await Company.find({
        geolocation: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: miles ? miles : 15000,
            $minDistance: 0,
          },
        },
      }).populate("user", [
        "name",
        "avatar",
        "googleAuth",
        "googleAuthBusiness",
      ]);
      res.json(companies);
    } else {
      let allCompanies = await Company.find({
        is_admin: true,
      }).populate("user", [
        "name",
        "avatar",
        "googleAuth",
        "googleAuthBusiness",
      ]);
      if (search) {
        allCompanies = await Company.find({
          is_admin: true,
          $or: [
            {
              name: { $regex: ".*" + search.toString() + ".*", $options: "i" },
            },
            {
              email: { $regex: ".*" + search.toString() + ".*", $options: "i" },
            },
            {
              phone: { $regex: ".*" + search.toString() + ".*", $options: "i" },
            },
            {
              website: {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              description: {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.street_address": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.street_address_2": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.city": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.province": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.country": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.postal": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
          ],
        }).populate("user", [
          "name",
          "avatar",
          "googleAuth",
          "googleAuthBusiness",
        ]);
      }
      if (page && limit && search) {
        let skip = parseInt(limit, 10) * parseInt(page, 10);

        //@ts-ignore
        const companies = await Company.find({
          is_admin: true,
          $or: [
            {
              name: { $regex: ".*" + search.toString() + ".*", $options: "i" },
            },
            {
              email: { $regex: ".*" + search.toString() + ".*", $options: "i" },
            },
            {
              phone: { $regex: ".*" + search.toString() + ".*", $options: "i" },
            },
            {
              website: {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              description: {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.street_address": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.street_address_2": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.city": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.province": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.country": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
            {
              "location.postal": {
                $regex: ".*" + search.toString() + ".*",
                $options: "i",
              },
            },
          ],
        })
          .populate("user", [
            "name",
            "avatar",
            "googleAuth",
            "googleAuthBusiness",
          ])
          .limit(parseInt(limit, 10))
          .skip(skip);
        res.json({ data: companies, total: allCompanies.length });
      } else if (page && limit) {
        let skip = parseInt(limit, 10) * parseInt(page, 10);

        //@ts-ignore
        const companies = await Company.find({
          is_admin: true,
        })
          .populate("user", [
            "name",
            "avatar",
            "googleAuth",
            "googleAuthBusiness",
          ])
          .limit(parseInt(limit, 10))
          .skip(skip);
        res.json({ data: companies, total: allCompanies.length });
      } else {
        res.json(allCompanies);
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/company
// @desc    Get all companies
// @access  Public
router.get("/", async (req, res) => {
  console.log("req", req.query);
  try {
    const { lat, lng, miles } = req.query;
    // if lat and long is not defined then return empty object

    //25 mile is approx 40233 m

    if (lat && lng) {
      const companies = await Company.find({
        geolocation: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: miles ? miles : 15000,
            $minDistance: 0,
          },
        },
      }).populate("user", [
        "name",
        "avatar",
        "googleAuth",
        "googleAuthBusiness",
      ]);
      res.json(companies);
    } else {
      const companies = await Company.find().populate("user", [
        "name",
        "avatar",
        "googleAuth",
        "googleAuthBusiness",
      ]);
      res.json(companies);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/company/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const companies = await Company.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar", "googleAuth", "googleAuthBusiness"]);

    if (!companies)
      return res.status(400).json({ msg: "User has no companies" });
    res.json(companies);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "User has no companies" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/company/:company_id
// @desc    Get company by company id
// @access  Public
router.get("/:company_id", async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.company_id,
    }).populate("user", [
      "_id",
      "name",
      "email",
      "avatar",
      "googleAuth",
      "googleAuthBusiness",
      "googleUserBusiness",
      "googleUser",
    ]);

    if (!company) return res.status(400).json({ msg: "No company found" });
    res.json(company);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "No company found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/company/business
// @desc    Delete a company
// @access  Private
router.delete("/business/:company_id", auth, async (req, res) => {
  try {
    // Remove company
    await Company.findOneAndRemove({
      _id: req.params.company_id,
      is_admin: true,
    });

    res.json({ msg: "Business deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/company
// @desc    Delete a company
// @access  Private
router.delete("/:company_id", auth, async (req, res) => {
  try {
    // Remove company
    await Company.findOneAndRemove({ _id: req.params.company_id });

    res.json({ msg: "Company deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/company/discipline
// @desc    Add profile experience
// @access  Private
router.put(
  "/discipline",
  [auth, [check("name", "Discipline name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, book_online } = req.body;

    const newDiscipline = {
      title,
      description,
      book_online,
    };

    try {
      const company = await Company.findOne({ user: req.user.id });

      company.disciplines.unshift(newDiscipline);

      await company.save();

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/company/discipline/:exp_id
// @desc    Delete a company discipline
// @access  Private
router.delete("/discipline/:discipline_id", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });

    // Get the remove index
    const removeIndex = company.disciplines
      .map((item) => item._id)
      .indexOf(req.params.discipline_id);

    company.disciplines.splice(removeIndex, 1);

    await company.save();

    res.json(company);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
// @route   PUT api/company/service/:service_id
// @desc    Add company service
// @access  Private
router.put(
  "/business/service/:service_id",
  [
    auth,
    [
      check("name", "Service name is required").not().isEmpty(),
      check("company_id", "Company id is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      _id,
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
      company_id,
    } = req.body;

    const newService = {
      _id,
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    };

    try {
      const company = await Company.findOne({ _id: company_id });
      const editIndex = company.services
        .map((item) => item._id)
        .indexOf(req.params.service_id);

      company.services[editIndex] = newService;
      //company.services.unshift(newService);

      await company.save();

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error" + err.message);
    }
  }
);

// @route   PUT api/company/service
// @desc    Add company service
// @access  Private
router.put(
  "/service",
  [auth, [check("name", "Service name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    } = req.body;

    const newService = {
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    };

    try {
      const company = await Company.findOne({ user: req.user.id });

      company.services.unshift(newService);

      await company.save();

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error" + err.message);
    }
  }
);

// @route   PUT api/company/business/service
// @desc    Add company service
// @access  Private
router.put(
  "/business/service",
  [
    auth,
    [
      check("name", "Service name is required").not().isEmpty(),
      check("company_id", "Company id is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      service_duration,
      company_id,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    } = req.body;

    const newService = {
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    };

    try {
      const company = await Company.findOne({ _id: company_id });

      company.services.unshift(newService);

      await company.save();

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error" + err.message);
    }
  }
);



// @route   PUT api/company/business/:company_id
// @access  Private
router.put("/business/:company_id", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    website,
    description,
    street_address,
    street_address_2,
    city,
    province,
    country,
    postal,
    email,
    phone,
    fax,
    lat,
    lng,
    facebook,
    twitter,
    linkedin,
    instagram,
    Sunday_open,
    Sunday_start_time,
    Sunday_end_time,
    Monday_open,
    Monday_start_time,
    Monday_end_time,
    Tuesday_open,
    Tuesday_start_time,
    Tuesday_end_time,
    Wednesday_open,
    Wednesday_start_time,
    Wednesday_end_time,
    Thursday_open,
    Thursday_start_time,
    Thursday_end_time,
    Friday_open,
    Friday_start_time,
    Friday_end_time,
    Saturday_open,
    Saturday_start_time,
    Saturday_end_time,
  } = req.body;

  // Build Company object
  const companyFields = {};
  companyFields.user = req.user.id;
  if (name) companyFields.name = name;
  if (website) companyFields.website = website;
  if (description) companyFields.description = description;
  if (email) companyFields.email = email;
  if (phone) companyFields.phone = phone;
  if (fax) companyFields.fax = fax;

  companyFields.store_hours = {
    Sunday: {
      open: Sunday_open,
      start_time: Sunday_start_time,
      end_time: Sunday_end_time,
    },
    Monday: {
      open: Monday_open,
      start_time: Monday_start_time,
      end_time: Monday_end_time,
    },
    Tuesday: {
      open: Tuesday_open,
      start_time: Tuesday_start_time,
      end_time: Tuesday_end_time,
    },
    Wednesday: {
      open: Wednesday_open,
      start_time: Wednesday_start_time,
      end_time: Wednesday_end_time,
    },
    Thursday: {
      open: Thursday_open,
      start_time: Thursday_start_time,
      end_time: Thursday_end_time,
    },
    Friday: {
      open: Friday_open,
      start_time: Friday_start_time,
      end_time: Friday_end_time,
    },
    Saturday: {
      open: Saturday_open,
      start_time: Saturday_start_time,
      end_time: Saturday_end_time,
    },
  };
  // Build social object
  companyFields.social = {
    facebook: facebook,
    twitter: twitter,
    linkedin: linkedin,
    instagram: instagram,
  };

  // Build location object
  companyFields.location = {
    lat: lat,
    lng: lng,
    street_address: street_address,
    street_address_2: street_address_2,
    city: city,
    province: province,
    country: country,
    postal: postal,
  };
  companyFields.geoLocation = {
    type: "Point",
    coordinates: [lat, lng],
  };

  // value must be in numeric. null value is not acceptable.
  if (lat && lng) {
    // Build  geo location object
    companyFields.geolocation = {
      type: "Point",
      coordinates: [lng, lat],
    };
  } else {
    // Build  geo location object
    companyFields.geolocation = {
      type: "Point",
      coordinates: [0, 0],
    };
  }
  try {
    // Update Database
    let company = await Company.findOne({ _id: req.params.company_id });

    if (company) {
      // Update
      company = await Company.findOneAndUpdate(
        { _id: req.params.company_id },
        { $set: companyFields },
        { new: true }
      );

      return res.json(company);
    } else {
      return res.status(404).json({
        message: "Business Not Found",
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/company/service/:service_id
// @desc    Add company service
// @access  Private
router.put(
  "/service/:service_id",
  [auth, [check("name", "Service name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      _id,
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    } = req.body;

    const newService = {
      _id,
      name,
      description,
      service_duration,
      price,
      book_online,
      call_to_book,
      book_site,
      book_site_link,
      intakeForm,
    };

    try {
      const company = await Company.findOne({ user: req.user.id });
      const editIndex = company.services
        .map((item) => item._id)
        .indexOf(req.params.service_id);

      company.services[editIndex] = newService;
      //company.services.unshift(newService);

      await company.save();

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error" + err.message);
    }
  }
);

// @route   DELETE api/company/business/:company_id/service/:service_id
// @desc    Delete a company service
// @access  Private
router.delete(
  "/business/:company_id/service/:service_id",
  auth,
  async (req, res) => {
    try {
      const company = await Company.findOne({ _id: req.params.company_id });
      const removeIndex = company.services
        .map((item) => item._id)
        .indexOf(req.params.service_id);

      company.services.splice(removeIndex, 1);

      await company.save();
      // Get the remove index

      res.json(company);
    } catch (err) {
      res.status(500).send("Server Error: Delete Service");
    }
  }
);
// @route   DELETE api/company/experience/:exp_id
// @desc    Delete a company experience
// @access  Private
router.delete("/service/:service_id", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    const removeIndex = company.services
      .map((item) => item._id)
      .indexOf(req.params.service_id);

    company.services.splice(removeIndex, 1);

    await company.save();
    // Get the remove index

    res.json(company);
  } catch (err) {
    res.status(500).send("Server Error: Delete Service");
  }
});

// @route   PUT api/company/like/:id
// @desc    Like a company
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    // Check if the post has already been liked by user
    if (
      company.likes.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.status(200).json({ msg: "Company already liked" });
    }

    company.likes.unshift({ user: req.user.id });

    await company.save();

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/company/unlike/:id
// @desc    Unlike a company
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    console.log(company);
    // Check if the post has already been liked by user
    if (
      company.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(200).json({ msg: "Company has not yet been liked" });
    }

    // Get the remove index
    const removeIndex = company.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    company.likes.splice(removeIndex, 1);

    await company.save();

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
