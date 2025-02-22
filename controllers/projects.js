const Project = require("../models/Project");
const Organization = require("../models/Organization");
const Technology = require("../models/Technology");

module.exports = {
  // get orgs from DB, map to array of names, and send to clientside(Organization.js) for awesomplete suggestions in organization field in the create project form
  getOrgs: async (req, res) => {
    console.log("getOrgs route accessed"); // Add this line
    try {
      const orgs = await Organization.find().lean();
      res.json(orgs.map((org) => org.name));
    } catch (err) {
      console.log(err);
    }
  }
  ,
  getTechnologies: async (req, res) => {
    try {
      const technologies = await Technology.find().lean();
      res.json(technologies);
    } catch (err) {
      console.log(err);
    }
  },
  // Render the create project form
  getCreate: async (req, res) => {
    try {
      res.render("create.ejs", {
        user: req.user,
        head: { title: "Create Project", css: "/css/pages/create-project.css" },
      });
      // Render the "create.ejs" view and pass the user and currentPage variables to the view
    } catch (err) {
      console.log(err);
    }
  },

  // Create a new project
  createProject: async (req, res) => {
    try {
      // Extract selected technologies from request body
      const technologyNames = req.body.technologies.split(",");

      // Find technology models by name
      const technologies = await Technology.find({
        name: { $in: technologyNames },
      });

      await Project.create({
        creator_id: req.user.id,
        name: req.body.name,
        organization: req.body.org,
        description: req.body.description,
        githubUrl: req.body.url,
        skillLevel: req.body.skill,
        status: req.body.status,
        timezone: req.body.timezone,
        technologiesUsed: technologies,
      });

      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  }, // Render the project detail page
  getProject: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      const technologies = await Technology.find({
        _id: { $in: project.technologiesUsed }
      });

      res.render("project-detail.ejs", {
        user: req.user,
        head: { title: project.name, css: "/css/pages/project-detail.css" },
        project: project,
        technologies: technologies
      });
    } catch (err) {
      console.log(err);
    }
  }, searchProjects: async (req, res) => {
    const searchQuery = req.query.query;

    try {
      let projects;

      if (searchQuery && typeof searchQuery === 'string') {
        // Use a regular expression to perform a case-insensitive search
        projects = await Project.find({
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
          ],
        });
      } else {
        // Handle the case where there's no valid search query
        // For example, render all projects or some default content
        projects = await Project.find(); // This could be all projects or some default content
      }

      res.render("browse.ejs", {
        user: req.user,
        projects: projects,
        head: { title: "Browse", css: "/css/pages/browse.css" },
      });
    } catch (err) {
      console.error(err);
      res.redirect("/"); // Redirect to the home page or an error page
    }
  },


};
