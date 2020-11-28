# Amazon Web Services

Install `aws-cli` and configure it with

```bash
~$ aws configure
```

or create these two files

- **`~/.aws/config`**

```
[default]
region=<your region>
```

- **`~/.aws/credentials`**

```
[default]
aws_access_key_id=<your_access_key_id>
aws_secret_access_key=<your_secret_access_key>
aws_session_token=<your_session_token>
```

To get your ID go to the AWS home page and select your username in the top right and click on “My Account”. You should see your account id under Account Settings.

```bash
~$ export ACCOUNT_ID=<xxxxxxxxxxxx>
```

```bash
~$ export AWS_REGION=<your_aws_region>
```