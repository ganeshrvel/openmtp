'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { styles } from './styles';
import { log } from '@Log';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import { APP_NAME, APP_TITLE, AUTHOR_EMAIL } from '../../constants/meta';
import { openExternalUrl } from '../../utils/url';
import { resetOverFlowY } from '../../utils/styleResets';
import { PRIVACY_POLICY_PAGE_TITLE } from '../../templates/privacyPolicyPage';

class PrivacyPolicyPage extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    resetOverFlowY();
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>{PRIVACY_POLICY_PAGE_TITLE}</title>
        </Helmet>
        <Typography variant="h5" className={styles.heading}>
          Privacy policy for {APP_NAME}
        </Typography>
        <div className={styles.body}>
          <p>
            <span>Effective date: December 28, 2018</span>
          </p>
          <p>
            <span>
              OpenMTP (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;)
              operates the https://github.com/ganeshrvel/openmtp app
              (hereinafter referred to as the &quot;Service&quot;).
            </span>
          </p>
          <p>
            <span>
              Ganesh Rathinavel built the &quot;OpenMTP&quot; app as an Open
              Source app. This SERVICE is provided by Ganesh Rathinavel at no
              cost and is intended for use as is.
            </span>
          </p>
          <p>
            <span>
              This page informs you of our policies regarding the collection,
              use, and disclosure of personal data when you use our Service and
              the choices you have associated with that data.
            </span>
          </p>
          <p>
            <span>
              We use your data to provide, study and improve the Service. By
              using the Service, you agree to the collection and use of
              information in accordance with this policy.
            </span>
          </p>
          <p>
            <span>
              <strong>Information Collection And Use</strong>
            </span>
          </p>
          <p>
            <span>
              We take your privacy very seriously and we DO NOT gather or
              transfer any sort of personal data out of your device in any form.
              We gather a very limited amount of ANONYMOUS information from you
              which will be used for various purposes such as providing and
              improving our Service to you. You may always choose not to share
              such ANONYMOUS information with us.
            </span>
          </p>
          <p>
            <span>
              <strong>Types of Data Collected</strong>
            </span>
          </p>
          <p>
            <span>Personal Data</span>
            <span>
              While using our Service, we DO NOT ask you to provide us with any
              kind of personally identifiable information that can be used to
              contact or identify you (&quot;Personal Data&quot;).
            </span>
          </p>
          <p>
            <span>
              <u>Cookies</u>: Cookies are files with a small amount of data that
              are commonly used as anonymous unique identifiers. These are sent
              to your browser from the websites that you visit and are stored on
              your device&#39;s internal memory.
            </span>
          </p>
          <p>
            <span>
              This Service does not use these &quot;cookies&quot; explicitly.
              However, the app may use third party code and libraries that use
              &ldquo;cookies&rdquo; to collect information and improve their
              services. You have the option to either accept or refuse these
              cookies and know when a cookie is being sent to your device. If
              you choose to refuse our cookies, you may not be able to use some
              portions of this Service.
            </span>
          </p>
          <p>
            <span>
              <u>Usage Data</u>: We may also collect anonymous information on
              how the Service is accessed and used (&quot;Usage Data&quot;).
              This Usage Data may include information such as your
              computer&#39;s Internet Protocol address (e.g. IP address),
              browser type, browser version, the pages of our Service that you
              visit, the time and date of your visit, the time spent on those
              pages, &quot;encrypted&quot; unique device identifiers and other
              diagnostic data.
            </span>
          </p>
          <p>
            <span>
              <u>LocalStorage Data</u>: We use &quot;LocalStorage&quot; and
              similar technologies to gather information about the activity on
              our Service and hold very limited information. LocalStorages are
              files with small amount of data which may include an anonymous
              unique identifier.
            </span>
          </p>
          <p>
            <span>
              You may always &quot;Opt-Out&quot; of sharing anonymous usage data
              with us by navigating to &quot;Settings&quot; option and disabling
              the &quot;Enable anonymous usage statistics gathering&quot;
              button.
            </span>
          </p>
          <p>
            <span>Examples of LocalStorage files we use:</span>
          </p>
          <ul>
            <li>
              <span>
                Analytics File. We use Analytics Storage to operate our
                analytics Service.
              </span>
            </li>
            <li>
              <span>
                Settings File. We use Settings Files to remember your
                preferences and various settings.
              </span>
            </li>
            <li>
              <span>
                Log Files. We use Log Files to collect the crash reports for
                other diagnostic reasons.
              </span>
            </li>
          </ul>
          <p>
            <span>
              <strong>Use of Data</strong>
            </span>
          </p>
          <p>
            <span>OpenMTP uses the collected data for various purposes:</span>
          </p>
          <ul>
            <li>
              <span>To provide and maintain the Service</span>
            </li>
            <li>
              <span>To notify you about changes to our Service</span>
            </li>
            <li>
              <span>
                To allow you to participate in interactive features of our
                Service when you choose to do so
              </span>
            </li>
            <li>
              <span>To provide customer care and support</span>
            </li>
            <li>
              <span>
                To provide analysis or valuable information so that we can
                improve the Service
              </span>
            </li>
            <li>
              <span>To monitor the usage of the Service</span>
            </li>
            <li>
              <span>To detect, prevent and address technical issues</span>
            </li>
          </ul>
          <p>
            <span>
              <strong>Transfer Of Data</strong>
            </span>
          </p>
          <p>
            <span>
              Your information may be transferred to &mdash; and maintained on
              &mdash; computers located outside of your state, province, country
              or other governmental jurisdiction where the data protection laws
              may differ than those from your jurisdiction.
            </span>
          </p>
          <p>
            <span>
              Your consent to this Privacy Policy followed by your submission of
              such information represents your agreement to that transfer.
            </span>
          </p>
          <p>
            <span>
              OpenMTP will take all steps reasonably necessary to ensure that
              your data is treated securely and in accordance with this Privacy
              Policy and no transfer of your Personal Data will take place to an
              organization or a country unless there are adequate controls in
              place including the security of your data and other personal
              information.
            </span>
          </p>
          <p>
            <span>
              <strong>Disclosure Of Data</strong>
            </span>
          </p>
          <p>
            <span>
              <u>Legal Requirements</u>
            </span>
          </p>
          <p>
            <span>
              OpenMTP may disclose your data in the good faith belief that such
              action is necessary to:
            </span>
          </p>
          <ul>
            <li>
              <span>To comply with a legal obligation</span>
            </li>
            <li>
              <span>
                To protect and defend the rights or property of OpenMTP
              </span>
            </li>
            <li>
              <span>
                To prevent or investigate possible wrongdoing in connection with
                the Service
              </span>
            </li>
            <li>
              <span>
                To protect the personal safety of users of the Service or the
                public
              </span>
            </li>
            <li>
              <span>To protect against legal liability</span>
            </li>
          </ul>
          <p>
            <span>
              <strong>Security Of Data</strong>
            </span>
          </p>
          <p>
            <span>
              The security of your data is important to us, but remember that no
              method of transmission over the Internet, or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your Personal Data, we cannot
              guarantee its absolute security.
            </span>
          </p>
          <p>
            <span>
              <strong>Service Providers</strong>
            </span>
          </p>
          <p>
            <span>
              We may employ third party companies and individuals to facilitate
              our Service (&quot;Service Providers&quot;), to provide the
              Service on our behalf, to perform Service-related services or to
              assist us in analyzing how our Service is used.
            </span>
          </p>
          <p>
            <span>
              These third parties have access to your Personal Data only to
              perform these tasks on our behalf and are obligated not to
              disclose or use it for any other purpose.
            </span>
          </p>
          <p>
            <span>
              <strong>Analytics</strong>
            </span>
          </p>
          <p>
            <span>
              We may use third-party Service Providers to monitor and analyze
              the use of our Service.
            </span>
          </p>
          <p>
            <span>Google Analytics</span>
          </p>
          <p>
            <span>
              Google Analytics is a web analytics service offered by Google that
              tracks and reports website/app traffic. Google uses the data
              collected to track and monitor the use of our Service. We respect
              the privacy of our users and we have chosen to &quot;Opt-Out&quot;
              of sharing the data with other Google products &amp; services. We
              will never allow Google to remarket or use your data for its
              advertising, benchmarking and other internal services.
            </span>
          </p>
          <p>
            <span>
              For more information on the privacy practices of Google, please
              visit the Google Privacy &amp; Terms web page:&nbsp;
              <a
                onClick={events => {
                  openExternalUrl(
                    'https://policies.google.com/privacy?hl=en',
                    events
                  );
                }}
              >
                https://policies.google.com/privacy?hl=en
              </a>
            </span>
          </p>
          <p>
            <span>
              <strong>Links To Other Sites</strong>
            </span>
          </p>
          <p>
            <span>
              Our Service may contain links to other sites that are not operated
              by us. If you click on a third party link, you will be directed to
              that third party&#39;s site. We strongly advise you to review the
              Privacy Policy of every site you visit.
            </span>
          </p>
          <p>
            <span>
              We have no control over and assume no responsibility for the
              content, privacy policies or practices of any third party sites or
              services.
            </span>
          </p>
          <p>
            <strong>
              <span>Internet Activity</span>
            </strong>
          </p>
          <p>
            <span>
              We periodically send out requests to GitHub.com servers to check
              for the latest app updates and to determine whether an internet
              connection is available.
            </span>
          </p>
          <p>
            <span>
              You may &quot;Opt-Out&quot; of the &quot;Auto App-update
              checks&quot; by navigating to &quot;Settings&quot; option and
              disabling the &quot;Enable auto-update check&quot; button.
            </span>
          </p>
          <p>
            <span>
              Please refer to&nbsp;
              <a
                onClick={events => {
                  openExternalUrl(
                    'https://help.github.com/articles/github-privacy-statement/',
                    events
                  );
                }}
              >
                https://help.github.com/articles/github-privacy-statement/
              </a>
              &nbsp;for more information.
            </span>
          </p>
          <p>
            <span>
              <strong>Plugins or Add-ons</strong>
            </span>
          </p>
          <p>
            <span>
              We have used google-ga npm package to facilitate the Google
              analytics feature inside the app.
            </span>
          </p>
          <p>
            <span>
              <strong>Crash Reports</strong>
            </span>
          </p>
          <p>
            <span>
              We have implemented a very powerful diagnostic tool to capture and
              report the Crash Reports and bug encountered by the application.
              The Crash Reports are stored inside your device as log files.
              These log files can be accessed by navigating to
              &quot;~/.io.ganeshrvel/openmtp/logs/&quot; folder. You may choose
              to send us these log files by selecting the &quot;Help&quot; menu
              &gt; &quot;Report Bugs&quot; and clicking on the &quot;EMAIL ERROR
              LOGS&quot; buttons.
            </span>
          </p>
          <p>
            <span>
              <strong>Children&#39;s Privacy</strong>
            </span>
          </p>
          <p>
            <span>
              Our Service does not address anyone under the age of 18
              (&quot;Children&quot;).
            </span>
          </p>
          <p>
            <span>
              We do not knowingly collect personally identifiable information
              from anyone under the age of 18. If you are a parent or guardian
              and you are aware that your Children has provided us with Personal
              Data, please contact us. If we become aware that we have collected
              Personal Data from children without verification of parental
              consent, we take steps to remove that information from our
              servers.
            </span>
          </p>
          <p>
            <span>
              <strong>Changes To This Privacy Policy</strong>
            </span>
          </p>
          <p>
            <span>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page.
            </span>
          </p>
          <p>
            <span>
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </span>
          </p>
          <p>
            <span>
              <strong>Contact Us</strong>
            </span>
          </p>
          <p>
            <span>
              If you have any questions about this Privacy Policy, please
              contact us:
            </span>
          </p>
          <p>
            <span>
              By email:&nbsp;
              <a
                onClick={events => {
                  openExternalUrl('mailto:ganeshrvel@outlook.com', events);
                }}
              >
                ganeshrvel@outlook.com
              </a>
            </span>
          </p>
          <p>
            <span>
              By visiting this page on the website:&nbsp;
              <a
                onClick={events => {
                  openExternalUrl('https://github.com/ganeshrvel', events);
                }}
              >
                https://github.com/ganeshrvel
              </a>
            </span>
          </p>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({}, dispatch);

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PrivacyPolicyPage));
