import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

class RegisterUserDto {
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	public userId: string

	@IsString()
	@IsNotEmpty()
	public nickName: string

	@IsString()
	@IsNotEmpty()
	public password: string
}

export default RegisterUserDto
