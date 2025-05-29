# licenses-from-spdx

This package generates a pair of data files listing all SPDX licenses and exceptions found
from the SPDX database. Use it as an NPM library or a command line tool.


<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<h3 align="center">licenses-from-spdx</h3>
<p align="center">Generate a local database of SPDX licenses and exceptions.</p>
<p>
    <a href="https://github.com/lkoskela/licenses-from-spdx"><strong>Explore the docs »</strong></a>
    ·
    <a href="https://github.com/lkoskela/licenses-from-spdx/issues">Report Bug</a>
    ·
    <a href="https://github.com/lkoskela/licenses-from-spdx/issues">Request Feature</a>
</p>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation-for-programmatic-use">Installation for programmatic use</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#programmatic-usage">Programmatic usage</a></li>
      </ul>
    </li>
    <!--
    <li><a href="#roadmap">Roadmap</a></li>
    -->
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>
<!--
-->


<!-- ABOUT THE PROJECT -->
## About The Project

The SPDX syntax for expressing license terms comes from the [Software Package Data eXchange (SPDX)](https://spdx.org/), a standard from the [Linux Foundation](https://www.linuxfoundation.org/) for shareable data about software package license terms. SPDX aims to make sharing and auditing license data easy, especially for users of open-source software.

The SPDX also hosts a set of data files describing those licenses in JSON and RDF formats, suitable for programmatic access.

The objective of `licenses-from-spdx` is to allow easily generating a local copy of the SPDX database.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Installation for command line use

**With a global install from the NPM registry:**

1. Install the NPM package globally
   ```sh
   $ npm install -g licenses-from-spdx
   ```

**By cloning the Git repository and installing locally:**

1. Clone the repo
   ```sh
   $ git clone https://github.com/lkoskela/licenses-from-spdx.git
   ```
2. Install NPM packages
   ```sh
   $ npm install
   ```
3. Link the CLI entrypoint to your PATH
   ```sh
   $ npm link
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

### Installation for programmatic use

1. Install the `licenses-from-spdx` package as a dependency
   ```sh
   $ npm install --save licenses-from-spdx
   ```
2. Import the generation function in your code...
   ```js
   import { generateLicenseData } from 'licenses-from-spdx'
   ```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->

## Usage

### Command line usage

After installing for command-line use, run the `licenses-from-spdx` command and tell it where to write your JSON files:

   ```sh
   $ licenses-from-spdx -l ~/Downloads/licenses.json -e ~/Downloads/exceptions.json
  ```

If the files exist and are recent enough, the tool won't bother regenerating them.

### Programmatic usage

Generate the SPDX license and exception files:
   ```js
   import { generateLicenseData } from 'licenses-from-spdx'

   const { licenses, exceptions } = await generateLicenseData('./licenses.json', './exceptions.json')
   ```

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap

None at the moment.

See [open issues](https://github.com/lkoskela/licenses-from-spdx/issues) for a full and up to date list of requested and proposed features (and known issues) and their state.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Once you feel good about the contribution, its tests all pass (`npm test`) and test coverage looks good, go ahead and open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See [LICENSE][license-url] for more information.

The Linux Foundation and its contributors license the SPDX standard under the terms of [the Creative Commons Attribution License 3.0 Unported (SPDX: "CC-BY-3.0")](http://spdx.org/licenses/CC-BY-3.0). "SPDX" is a United States federally registered trademark of the [Linux Foundation](https://www.linuxfoundation.org/). The authors of this package license their work under the terms of the [MIT License](https://spdx.org/licenses/MIT.html).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Othneil Drew](https://github.com/othneildrew) for the [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/lkoskela/licenses-from-spdx.svg?style=for-the-badge
[contributors-url]: https://github.com/lkoskela/licenses-from-spdx/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/lkoskela/licenses-from-spdx.svg?style=for-the-badge
[forks-url]: https://github.com/lkoskela/licenses-from-spdx/network/members
[stars-shield]: https://img.shields.io/github/stars/lkoskela/licenses-from-spdx.svg?style=for-the-badge
[stars-url]: https://github.com/lkoskela/licenses-from-spdx/stargazers
[issues-shield]: https://img.shields.io/github/issues/lkoskela/licenses-from-spdx.svg?style=for-the-badge
[issues-url]: https://github.com/lkoskela/licenses-from-spdx/issues
[license-shield]: https://img.shields.io/github/license/lkoskela/licenses-from-spdx.svg?style=for-the-badge
[license-url]: https://github.com/lkoskela/licenses-from-spdx/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/lassekoskela
