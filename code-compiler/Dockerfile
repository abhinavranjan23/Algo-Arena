FROM public.ecr.aws/lambda/python:3.11
# Copy the function code


RUN yum install -y  gcc gcc-c++
RUN yum install java-1.8.0-openjdk-devel -y
RUN curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - && \
    yum install -y nodejs


COPY requirements.txt ${LAMBDA_TASK_ROOT}

COPY lambda_function.py ${LAMBDA_TASK_ROOT}

RUN pip install -r requirements.txt 
CMD ["lambda_function.handler"]