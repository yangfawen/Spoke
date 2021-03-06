import React, { Component } from "react";
import PropTypes from "prop-types";
import { withApi } from "../contexts/ApiContext";
import NavBar from "../navigation/NavBar";
import styles from "./ProjectsPage.scss";
import ProjectGrid from "./ProjectGrid";
import Footer from "../navigation/Footer";
import Button from "../inputs/Button";
import PrimaryLink from "../inputs/PrimaryLink";
import Loading from "../Loading";
import { connectMenu, ContextMenu, MenuItem } from "react-contextmenu";
import "../styles/vendor/react-contextmenu/index.scss";
import templates from "./templates";

const contextMenuId = "project-menu";

class ProjectsPage extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.props.api
      .getProjects()
      .then(projects => {
        this.setState({
          projects: projects.map(project => ({
            ...project,
            url: `/projects/${project.id}`
          })),
          loading: false
        });
      })
      .catch(error => {
        console.error(error);

        if (error.response && error.response.status === 401) {
          // User has an invalid auth token. Prompt them to login again.
          this.props.api.logout();
          return this.props.history.push("/login", { from: "/projects" });
        }

        this.setState({ error, loading: false });
      });
  }

  onDeleteProject = project => {
    this.props.api
      .deleteProject(project.id)
      .then(() => this.setState({ projects: this.state.projects.filter(p => p.id !== project.id) }))
      .catch(error => this.setState({ error }));
  };

  renderContextMenu = props => {
    return (
      <ContextMenu id={contextMenuId}>
        <MenuItem onClick={e => this.onDeleteProject(props.trigger.project, e)}>Delete Project</MenuItem>
      </ContextMenu>
    );
  };

  ProjectContextMenu = connectMenu(contextMenuId)(this.renderContextMenu);

  render() {
    const { error, loading, projects } = this.state;

    let content;

    if (loading) {
      content = (
        <div className={styles.loadingContainer}>
          <Loading message="Loading projects..." />
        </div>
      );
    } else {
      content = <ProjectGrid projects={projects} newProjectUrl="/projects/new" contextMenuId={contextMenuId} />;
    }

    const ProjectContextMenu = this.ProjectContextMenu;

    const topTemplates = [];

    for (let i = 0; i < templates.length && i < 4; i++) {
      topTemplates.push(templates[i]);
    }

    return (
      <>
        <NavBar />
        <main>
          <section className={styles.projectsSection}>
            <div className={styles.projectsContainer}>
              <div className={styles.projectsHeader}>
                <h1>Templates</h1>
                <PrimaryLink to="/projects/templates">View More</PrimaryLink>
              </div>
              <ProjectGrid projects={topTemplates} />
            </div>
          </section>
          <section className={styles.projectsSection}>
            <div className={styles.projectsContainer}>
              <div className={styles.projectsHeader}>
                <h1>Projects</h1>
                <Button medium to="/projects/new">
                  New Project
                </Button>
              </div>
              {error && <div className={styles.error}>{error.message || "There was an unknown error."}</div>}
              {content}
            </div>
          </section>
          <ProjectContextMenu />
        </main>
        <Footer />
      </>
    );
  }
}

export default withApi(ProjectsPage);
