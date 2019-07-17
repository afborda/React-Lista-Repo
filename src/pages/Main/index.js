import React, { Component } from "react";
import moment from "moment";
import api from "../../services/api";

import logo from "../../assets/logo.png";

import { Container, Form } from "./styles";

import CompareList from "../../components/CompareList/index";

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: "",
    repositories: []
  };

  async componentDidMount() {
    this.setState({ loading: true });
    this.setState({
      loading: false,
      repositories: await this.getLocalRepositories()
    });
  }

  handleAddRepository = async e => {
    e.preventDefault();
    this.setState({ loading: true });

    const { repositories } = this.state;

    try {
      const { data: repository } = await api.get(
        `/repos/${this.state.repositoryInput}`
      );
      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState({
        repositoryInput: "",
        repositories: [...repositories, repository],
        repositoryError: false
      });
      const localRepositories = await this.getLocalRepositories();

      await localStorage.setItem(
        "@GitCompare:repositories",
        JSON.stringify([...localRepositories, repository])
      );
    } catch (err) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  getLocalRepositories = async () =>
    JSON.parse(await localStorage.getItem("@GitCompare:repositories")) || [];

  handleRemoveRepository = async id => {
    const { repositories } = this.state;
    const updateRepositories = repositories.filter(
      repository => repository.id !== id
    );
    this.setState({ repositories: updateRepositories });
    await localStorage.setItem(
      "@GitCompare:repositories",
      JSON.stringify(updateRepositories)
    );
  };

  handleUpdateRepository = async id => {
    const { repositories } = this.state;
    const repository = repositories.find(repo => repo.id === id);
    try {
      const { data } = await api.get(`/repos/${repository.full.nam}`);
      data.last_commit = moment(data.pushed_at).fromNow();

      this.state({
        repositoryError: false,
        repositoryInput: "",
        repositories: repositories.map(repo =>
          repo.id === data.id ? data : repo
        )
      });

      await localStorage.setItem(
        "@GitCompare:repositores",
        JSON.stringify(repositories)
      );
    } catch (err) {
      this.setState({ repositoryError: true });
    }
  };

  render() {
    const {
      repositories,
      repositoryInput,
      repositoryError,
      loading
    } = this.state;
    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form
          withError={this.state.repositoryError}
          onSubmit={this.handleAddRepository}
        >
          <input
            type="text"
            placeholder="Usuário/repositório"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {this.state.loading ? (
              <i className="fa fa-spinner fa-pulse" />
            ) : (
              "OK"
            )}
          </button>
        </Form>

        <CompareList repositories={this.state.repositories} />
      </Container>
    );
  }
}
