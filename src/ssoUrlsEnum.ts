function getSsoUrl(subDomain) {
    return {
        PROD:   `https://${subDomain}.redhat.com/auth`,
        STAGE:  `https://${subDomain}.stage.redhat.com/auth`,
        QA:     `https://${subDomain}.qa.redhat.com/auth`,
        DEV:    `https://${subDomain}.dev.redhat.com/auth`,
        DEV1:   `https://${subDomain}.dev1.redhat.com/auth`,
        DEV2:   `https://${subDomain}.dev2.redhat.com/auth`,
    }
}