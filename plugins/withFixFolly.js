const { withXcodeProject } = require('expo/config-plugins');

function setFollyFlags(project) {
  const configurations = project.pbxXCBuildConfigurationSection();
  
  // Flag to set in the OTHER_CPLUSPLUSFLAGS build setting
  const flag = '-DFOLLY_CFG_NO_COROUTINES=1';
  
  // Loop through all build configurations (Debug, Release, etc.)
  for (const configName in configurations) {
    const config = configurations[configName];
    if (typeof config === 'object' && config.buildSettings) {
      const buildSettings = config.buildSettings;
      
      // Ensure OTHER_CPLUSPLUSFLAGS is treated as an array
      if (!buildSettings.OTHER_CPLUSPLUSFLAGS) {
        buildSettings.OTHER_CPLUSPLUSFLAGS = ['$(inherited)'];
      } else if (typeof buildSettings.OTHER_CPLUSPLUSFLAGS === 'string') {
        buildSettings.OTHER_CPLUSPLUSFLAGS = [buildSettings.OTHER_CPLUSPLUSFLAGS];
      }
      
      // Add the flag if it's not already present
      if (!buildSettings.OTHER_CPLUSPLUSFLAGS.includes(flag)) {
        buildSettings.OTHER_CPLUSPLUSFLAGS.push(flag);
        console.log(`[withFixFolly] Added Folly fix flag to build config: ${configName}`);
      }
    }
  }
  return project;
}

const withFixFolly = (config) => {
  return withXcodeProject(config, (config) => {
    config.modResults = setFollyFlags(config.modResults);
    return config;
  });
};

module.exports = withFixFolly;