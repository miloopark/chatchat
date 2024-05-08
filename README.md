<!-- PROJECT LOGO -->
<h1 align="center" style="font-family:verdana">chatsqrd</h1>
  <p align="center">
    Learn, Laugh, and Grow with Every Chat!
  </p>
</div>

<div>&nbsp;&nbsp;</div>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li> <a href="#git-commit-convention">Git Commit Convention</a> </li>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- GIT CONVENTION -->

## Git Commit Convention

1. Make a branch before you start working on your code. <br>
   `git checkout -b <new branch name>` <br>
   ⚠️ We are going to be creating branch names with the Jira Issue ID followed by the type of branch prefix (see bottom of this README) <br>
   How we should name branches:
   > ex) `feature/AN-26@create-button-component`
2. After you are done with implementing each issue, create a PR to `dev`.

   1. Commit and push the branch you created.
   2. Create a Pull Request in this repository.
   3. Name you PR correctly according to our Git convention.
   4. Fill out the PR description template.
   5. Label your PR.

   ⚠️ The PR title should be something similar to your branch name. The Jira Issue ID and a short summary of what you implemented. <br>

   > `[AN-24]: create-button-component` <br>
   > ❗ You can label your PR by select the tag on the right side of the PR screen under "Label". <br>

   > You might also have to fast-forward your current working branch to dev in order to prevent merge conflicts.

3. Review the PR.

   ❗❗ Reviewing your peers' code is important. It is not about just clicking "approve". See the changes and comment on the code. <br>
   Suggest them with a better code style. Ask them what you don't understand from the code.

   > `dev` is a protected branch. We need your reviews and approval in order to merge.
   > read your peer's code and add comments to them if needed!
   > It would be great if you switch out to their branch and test it with the simulator running.

4. Merge to `dev`.

   1. When the reviewing process is done and is approved, check for conflicts. <br>
   2. If there are no conflicts the person who created the PR will merge to dev. <br><br>
      ⚠️ MERGING SHOULD BE DONE BY THE PERSON WHO IMPLEMENTED THE CODE!

5. After each SPRINT, Thanh will merge `dev` to `main`.
   > ⭐ Remember to pull before starting any work!!

## Useful stuff

### Check for confilcts

⭐ Don't forget to pull from `dev` and rebase before creating a PR or before merging into `dev`!<br>

1.  Switch out to dev. `git switch dev`
2.  Pull from dev. `git pull`
3.  Switch back to you current working branch. `git switch <your branch name>`
4.  Rebase dev to your branch. `git rebase dev`
5.  If there are conflicts, resolve them.
6.  After resolving, force push your changes again.
    > `git push -f`

> all of your local branches with `git branch` <br>
> update your local like the remote with `git remote update` <br>
> all of the branches (local and remote) with `git branch -a` <br>

⚠️ If there is an error doing `pull` try `git config --global pull.rebase true`. <br>
(I use rebase for default when pulling.)

### Testing the App on a different branch

1. Switch out to the `dev` branch.
   > `git switch dev`
2. Update your local sot that its in the same state as remote.
   > `git remote update`
3. Switch to the branch you are testing.
   > `git checkout branchname` > `branchname` should be the name of the branch that you want to checkout to.
   > you can see the branches by using `git branch -a`.
4. Pull from the branch once more just to make sure.

### PR convention

⭐ Don't use past tense for git commit, branches, PR.

| branch prefix | use                                                                   |
| ------------- | --------------------------------------------------------------------- |
| hotfix        | for quickly fixing critical issues usually with a temporary solution  |
| fix           | for fixing a bug                                                      |
| feature       | for adding, removing or modifying a feature                           |
| refactor      | for modifying the code as in a different style, delete comments, etc. |
| WIP           | for a work in progress                                                |

<!-- ABOUT THE PROJECT -->

# About The Project

### Built With React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/miloopark/chatchat.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = "ENTER YOUR API";
   ```

<!-- USAGE EXAMPLES -->

## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.md` for more information.

<!-- CONTACT -->

## Contact

Min Sung Park minpark@bu.edu
Thanh Huynh thanh910@bu.edu
Jiehoon Lee jiehoonn@bu.edu
Emmeline Chung emmchung@bu.edu

Project Link: [[https://github.com/miloopark/chatchat](https://github.com/miloopark/chatchat)](https://chatchat-ce029.web.app/)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/miloopark/chatchat.svg?style=for-the-badge
[contributors-url]: https://github.com/miloopark/chatchat/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/miloopark/chatchat.svg?style=for-the-badge
[forks-url]: https://github.com/miloopark/chatchat/network/members
[stars-shield]: https://img.shields.io/github/stars/miloopark/chatchat.svg?style=for-the-badge
[stars-url]: https://github.com/miloopark/chatchat/stargazers
[issues-shield]: https://img.shields.io/github/issues/miloopark/chatchat.svg?style=for-the-badge
[issues-url]: https://github.com/miloopark/chatchat/issues
[license-shield]: https://img.shields.io/github/license/miloopark/chatchat.svg?style=for-the-badge
[license-url]: https://github.com/miloopark/chatchat/LICENSE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/miloopark
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
