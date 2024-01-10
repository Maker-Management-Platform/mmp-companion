## Maker Management Platform Companion

This chrome extension enables or simplifies the way projects are imported from external platforms.

## Supported platforms
- makerworld.com
- thigiverse.com

## Instalation && Utilization
- Download the extension zip [here](https://github.com/Maker-Management-Platform/mmp-companion/releases) and extract it, or clone this repo
- Go to chrome -> manage extensions (chrome://extensions/)
- In the upper right corner, enable developer mode
- Load Unpacked extension, by selection the folder you previously created

- A new extension should have oped up in your bar, with an horrendous icon (I really could use some help with icons/images)...
- Pin it to the bar (recomended)
- Navigate to your MMP instalation
- Click the extenxion then the "Initialize", no the extension is configured to comunicate with that server
- Now navigate to a project page on one of the supported platforms, click the extension and click import
- You can monitor the import process in MMP logs, after a while the new project should be available in the UI

# Integration descriptions:

### MakerWorld.com
This extension copies your current session data (authentication cookies) and the current url that you are visiting and sends it to your instance of MMP, allowing it to impersonate you and download all the project assets.
#### DISCLAMER
This integration sometimes fails due to anti scraping techniques and could get your account banned

### Thingiverse.com
This extension sends the current url that you are visiting to your instance of MMP, and downloads the project using the configured API key
