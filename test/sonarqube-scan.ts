import * as sonarqubeScanner from 'sonarqube-scanner';

const serverUrl = process.env.SONARQUBE_URL;

async function sonarScanner() {
  if (!serverUrl) {
    console.log('SonarQube url not set. Nothing to do...');
    return;
  }

  sonarqubeScanner({
    serverUrl,
    options: {
      'sonar.login': process.env.SONARQUBE_USER,
      'sonar.password': process.env.SONARQUBE_PASSWORD,
      'sonar.sources': 'src',
      'sonar.coverage.exclusions': 'src/logger/*',
      'sonar.tests': 'test',
      'sonar.language': 'ts',
      'sonar.typescript.lcov.reportPaths' : 'coverage/lcov.info',
      'sonar.testExecutionReportPaths': 'test-report.xml',
      'sonar.sourceEncoding': 'UTF-8',
    }
  }, result => {
    console.log('Sonarqube scanner result:', result);
  });
}

sonarScanner()
  .catch(err => {
    console.error('Error during sonar scan', err);
    process.exit(1);
  });
